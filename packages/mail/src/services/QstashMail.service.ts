import { eq } from "drizzle-orm";

import { type DatabaseType } from "@workspace/drizzle/types";
import { EmailTable } from "@workspace/drizzle/schemas";
import {
  IQstashService,
  type QstashPublishOptions,
  type QstashPublishResult,
  QstashService,
  QstashServiceConfig,
} from "@workspace/lib/qstash";
import { QstashError } from "@workspace/lib/qstash/error";
import { type IUpstashRatelimit } from "@workspace/lib/rate-limit/upstash";
import { type ExtendedRedis } from "@workspace/lib/redis/upstash";
import { MailError } from "@workspace/lib/utils";

import { IMailTransport } from "../transports";
import type {
  InboundEmailPayload,
  InboundEmailResult,
  QstashMailResult,
  SendMailOption,
} from "../types";
import { EmailService } from "./Email.service";
import { EmailThreadService } from "./EmailThread.service";

/** Route key used to register and publish mail messages. */
const MAIL_ROUTE_KEY = "mail";

/** Default deduplication window (seconds) applied to sent mails. */
const DEFAULT_DEDUP_WINDOW_SECONDS = 300;

/** Everything needed to publish and finalize a single prepared mail. */
interface PreparedMail {
  /** Id of the persisted outbound email record. */
  emailId: string;
  /** Thread the mail belongs to, when not a system mail. */
  threadId?: string;
  /** Redis key used to suppress duplicates. */
  dedupKey: string;
}

export interface MailCallbackPayload {
  emailId: string;
  threadId?: string | undefined;
}

export interface SendMailBatchItem {
  /** The mail to send. */
  options: SendMailOption;
  /** Whether this is a system mail (skips thread creation). Defaults to true. */
  isSystemMail?: boolean;
}

export interface QstashMailConfig {
  database: DatabaseType;
  redisClient: ExtendedRedis;
  minRatelimit: IUpstashRatelimit;
  hourRatelimit: IUpstashRatelimit;
  callbackUrl: string;
  receiptCallbackUrl: string;
  failureCallbackUrl: string;
  dedupWindowSeconds?: number;
}

export interface IQstashMailService extends IQstashService {
  processMailCallback(
    payload: MailCallbackPayload,
    context: { messageId: string }
  ): Promise<void>;
  processInboundEmail(
    payload: InboundEmailPayload
  ): Promise<InboundEmailResult>;
  processMailSent(resendId: string, resendMessageId: string): Promise<void>;
  processMailFailed(resendId: string): Promise<void>;
  processMailBounced(resendId: string): Promise<void>;
  processMailComplained(resendId: string): Promise<void>;
  processMailSuppressed(resendId: string): Promise<void>;
  processMailDeliveryDelayed(resendId: string): Promise<void>;
  processMailDelivered(resendId: string): Promise<void>;
  sendMail(
    options: SendMailOption,
    isSystemMail?: boolean
  ): Promise<QstashMailResult>;
  sendMailBatch(items: SendMailBatchItem[]): Promise<QstashMailResult[]>;
  handleMailReceipt(qMessageId: string): Promise<void>;
  handleMailFailure(qMessageId: string): Promise<void>;
  handleRetryMail(qMessageId: string): Promise<QstashMailResult>;
}

/**
 * QStash-backed mail service.
 *
 * Mails are not sent inline: each `sendMail` / `sendMailBatch` call persists an
 * outbound record and publishes a QStash message whose callback
 * ({@link processMailCallback}) performs the actual transport send. Delivery
 * and failure callbacks keep the email record in sync.
 */
export abstract class QstashMailService
  extends QstashService
  implements IQstashMailService
{
  protected readonly qstashMailConfig: QstashMailConfig & {
    dedupWindowSeconds: number;
  };
  private EmailthreadService: EmailThreadService;
  private emailService: EmailService;

  constructor(
    protected readonly mailTransport: IMailTransport,
    qstashMailConfig: QstashMailConfig,
    qstashConfig: QstashServiceConfig
  ) {
    super(qstashConfig);
    this.qstashMailConfig = this.normalizeQstashMailConfig(qstashMailConfig);

    this.EmailthreadService = new EmailThreadService(qstashMailConfig.database);
    this.emailService = new EmailService(qstashMailConfig.database);

    this.registerCallbackHandler<MailCallbackPayload>(
      MAIL_ROUTE_KEY,
      this.processMailCallback.bind(this)
    );
    this.registerReceiptHandler(
      MAIL_ROUTE_KEY,
      this.handleMailReceipt.bind(this)
    );
  }

  // ─── Configuration & small helpers ────────────────────────────────────────

  /** Apply mail-specific defaults. */
  private normalizeQstashMailConfig(
    config: QstashMailConfig
  ): QstashMailConfig & { dedupWindowSeconds: number } {
    return {
      ...config,
      dedupWindowSeconds:
        config.dedupWindowSeconds ?? DEFAULT_DEDUP_WINDOW_SECONDS,
    };
  }

  /** Merge thread/reply headers into the outbound header map. */
  protected buildHeaders(
    prevHeaders?: Record<string, string> | undefined,
    inReplyTo?: string | null | undefined,
    references?: string[] | undefined
  ): Record<string, string> {
    const headers: Record<string, string> = {
      ...prevHeaders,
    };

    if (inReplyTo) {
      headers["In-Reply-To"] = `<${inReplyTo}>`;
    }

    if (references && references.length > 0) {
      headers["References"] = references.map((ref) => `<${ref}>`).join(" ");
    }

    return headers;
  }

  /** Build the dedup key from the recipient set and subject. */
  private generateMailDedupKey(options: SendMailOption): string {
    const to = this.emailService
      .normalizeRecipients(options.to)
      .map((r) => r.email)
      .join(",");
    return this.generateDedupKey(`mail:${to}|${options.subject}`, "mail");
  }

  /** Enforce both the per-minute and per-hour recipient rate limits. */
  private async checkRateLimit(recipient: string): Promise<void> {
    const [minute, hour] = await Promise.all([
      this.qstashMailConfig.minRatelimit.limit(recipient),
      this.qstashMailConfig.hourRatelimit.limit(recipient),
    ]);

    const firstFailure = [minute, hour].find((r) => !r.success);
    if (firstFailure) {
      throw new MailError(
        `Rate limit exceeded. Resets at ${new Date(
          firstFailure.reset * 1000
        ).toISOString()}`,
        "MAIL_RATE_LIMITED",
        429
      );
    }
  }

  /** Reject a mail when its dedup key is still within the dedup window. */
  private async checkDuplicate(key: string): Promise<void> {
    const exists = await this.qstashMailConfig.redisClient.get(key);

    if (exists) {
      throw new MailError(
        "Duplicate email suppressed within dedup window.",
        "MAIL_DUPLICATE_SUPPRESSED",
        409
      );
    }
  }

  /** Record the dedup key with the configured TTL. */
  private async markProcessed(key: string, value: string): Promise<void> {
    await this.qstashMailConfig.redisClient.set(key, value, {
      ex: this.qstashMailConfig.dedupWindowSeconds,
    });
  }

  /** Strip the surrounding angle brackets from a message id. */
  private cleanMessageId(messageId: string): string {
    return messageId.replace(/^<|>$/g, "");
  }

  // ─── Sending ──────────────────────────────────────────────────────────────

  /**
   * Persist and publish a single mail.
   *
   * @throws {MailError|QstashError} for validation, rate-limit, dedup and
   * publish failures; other failures are returned as a failed result.
   */
  public async sendMail(
    options: SendMailOption,
    isSystemMail: boolean = true
  ): Promise<QstashMailResult> {
    try {
      const mail = await this.prepareMail(options, isSystemMail);
      const result = await this.publish<MailCallbackPayload>(
        this.buildPublishOptions(mail)
      );
      await this.finalizeMail(mail, result);

      return this.toSuccessResult(mail, result);
    } catch (err) {
      if (err instanceof MailError || err instanceof QstashError) throw err;

      return this.toErrorResult(err);
    }
  }

  /**
   * Persist and publish several mails in a single QStash batch request.
   *
   * Each item is validated, rate-limited, deduplicated and persisted before a
   * single {@link QstashService.publishBatch} call is made. Items that fail
   * during preparation are reported individually; the remaining items are
   * still batched.
   *
   * @returns one {@link QstashMailResult} per input item, in the same order.
   */
  public async sendMailBatch(
    items: SendMailBatchItem[]
  ): Promise<QstashMailResult[]> {
    if (items.length === 0) return [];

    const results: QstashMailResult[] = new Array(items.length);
    const prepared: Array<{ index: number; mail: PreparedMail }> = [];

    await Promise.all(
      items.map(async (item, index) => {
        try {
          const mail = await this.prepareMail(
            item.options,
            item.isSystemMail ?? true
          );
          prepared.push({ index, mail });
        } catch (err) {
          results[index] = this.toErrorResult(err);
        }
      })
    );

    if (prepared.length === 0) return results;

    try {
      const published = await this.publishBatch<MailCallbackPayload>(
        prepared.map(({ mail }) => this.buildPublishOptions(mail))
      );

      await Promise.all(
        prepared.map(async ({ index, mail }, i) => {
          const result = published[i];
          if (!result) {
            results[index] = {
              success: false,
              error: "Missing publish result",
            };
            return;
          }

          await this.finalizeMail(mail, result);
          results[index] = this.toSuccessResult(mail, result);
        })
      );
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Unknown error occurred";
      for (const { index } of prepared) {
        results[index] = { success: false, error };
      }
    }

    return results;
  }

  /**
   * Validate a mail, enforce rate limits/dedup and persist its outbound record.
   * Shared by {@link sendMail} and {@link sendMailBatch}.
   */
  private async prepareMail(
    options: SendMailOption,
    isSystemMail: boolean
  ): Promise<PreparedMail> {
    if (!options.html && !options.text) {
      throw new MailError(
        "Either 'html' or 'text' must be provided",
        "MAIL_INVALID_PAYLOAD",
        400
      );
    }

    const primaryRecipient = this.emailService.extractPrimaryRecipient(
      options.to
    );
    await this.checkRateLimit(primaryRecipient.email);

    const dedupKey = this.generateMailDedupKey(options);
    await this.checkDuplicate(dedupKey);

    let threadId: string | undefined = undefined;
    if (!isSystemMail) {
      threadId = await this.EmailthreadService.findOrCreateThread({
        threadId: options.threadId,
        subject: `Te: ${options.subject}`,
        contactEmail: primaryRecipient.email,
        contactName: primaryRecipient.name,
      });
    }

    const references = options.inReplyTo
      ? [...(options.references ?? []), options.inReplyTo]
      : options.references;

    const { emailId } = await this.emailService.createOutboundEmailRecord({
      options: {
        ...options,
        headers: this.buildHeaders(
          options.headers,
          options.inReplyTo,
          references
        ),
      },
      threadId,
    });

    return {
      emailId,
      threadId,
      dedupKey,
    };
  }

  /** Build the QStash publish payload (and callbacks) for a prepared mail. */
  private buildPublishOptions(
    mail: PreparedMail
  ): QstashPublishOptions<MailCallbackPayload> {
    return {
      body: {
        emailId: mail.emailId,
        threadId: mail.threadId,
      },
      url: this.qstashMailConfig.callbackUrl,
      callback: this.qstashMailConfig.receiptCallbackUrl,
      failureCallback: this.qstashMailConfig.failureCallbackUrl,
      routeKey: MAIL_ROUTE_KEY,
    };
  }

  /** Link the published QStash message back to the email record. */
  private async finalizeMail(
    mail: PreparedMail,
    result: QstashPublishResult
  ): Promise<void> {
    await Promise.all([
      this.markProcessed(mail.dedupKey, result.messageId),
      this.updateMessage(result.messageId, {
        deduplicationId: result.deduplicationId,
      }),
      this.qstashMailConfig.database
        .update(EmailTable)
        .set({ qMessageId: result.messageId })
        .where(eq(EmailTable.id, mail.emailId)),
    ]);
  }

  /** Shape a successful publish into the public mail result. */
  private toSuccessResult(
    mail: PreparedMail,
    result: QstashPublishResult
  ): QstashMailResult {
    return {
      success: true,
      qMessageId: result.messageId,
      deduplicationId: result.deduplicationId,
      emailId: mail.emailId,
      threadId: mail.threadId,
    };
  }

  /** Shape a thrown value into a failed mail result. */
  private toErrorResult(err: unknown): QstashMailResult {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }

  // ─── Delivery processing ──────────────────────────────────────────────────

  /** QStash callback that performs the actual transport send. */
  public async processMailCallback(
    payload: MailCallbackPayload,
    context: { messageId: string }
  ): Promise<void> {
    try {
      const options = await this.emailService.buildOutboundEmailOptions(
        payload.emailId
      );

      const resendId = await this.mailTransport.send(options);

      await this.qstashMailConfig.database
        .update(EmailTable)
        .set({
          resendId,
        })
        .where(eq(EmailTable.id, payload.emailId));
    } catch (err) {
      if (err instanceof MailError || err instanceof QstashError) throw err;

      throw new MailError(
        err instanceof Error ? err.message : "Unknown error occurred",
        "MAIL_TRANSPORT_FAILED",
        500,
        { messageId: context.messageId }
      );
    }
  }

  /** Handle a delivery receipt for a mail message. */
  public async handleMailReceipt(qMessageId: string): Promise<void> {
    await this.handleDeliveryReceipt(qMessageId, MAIL_ROUTE_KEY);
  }

  /** Mark a mail as failed after its failure callback fires. */
  public async handleMailFailure(qMessageId: string): Promise<void> {
    await this.handleFailed(qMessageId);

    const [emailData] = await this.qstashMailConfig.database
      .select({ id: EmailTable.id })
      .from(EmailTable)
      .where(eq(EmailTable.qMessageId, qMessageId))
      .limit(1);

    if (emailData) {
      await this.qstashMailConfig.database
        .update(EmailTable)
        .set({
          status: "failed",
        })
        .where(eq(EmailTable.id, emailData.id));
    }
  }

  /** Re-publish a failed mail from its stored QStash message. */
  public async handleRetryMail(qMessageId: string): Promise<QstashMailResult> {
    try {
      const result = await this.retryMessage(qMessageId, {
        routeKey: MAIL_ROUTE_KEY,
      });
      return {
        success: true,
        qMessageId: result.messageId,
        deduplicationId: result.deduplicationId,
      };
    } catch (err) {
      if (err instanceof QstashError) throw err;
      throw new MailError(
        err instanceof Error ? err.message : "Unknown error occurred",
        "MAIL_TRANSPORT_FAILED",
        500,
        { messageId: qMessageId }
      );
    }
  }

  // ─── Status updates ───────────────────────────────────────────────────────

  /** Mark the email record as sent using the transport's message id. */
  public async processMailSent(
    resendId: string,
    resendMessageId: string
  ): Promise<void> {
    await this.emailService.updateEmailByResendId(
      resendId,
      {
        status: "sent",
        resendMessageId: this.cleanMessageId(resendMessageId),
      },
      this.qstashMailConfig.database
    );
  }

  public async processMailFailed(resendId: string): Promise<void> {
    await this.emailService.updateEmailByResendId(
      resendId,
      {
        status: "failed",
      },
      this.qstashMailConfig.database
    );
  }

  public async processMailBounced(resendId: string): Promise<void> {
    await this.emailService.updateEmailByResendId(
      resendId,
      {
        status: "bounced",
      },
      this.qstashMailConfig.database
    );
  }

  public async processMailComplained(resendId: string): Promise<void> {
    await this.emailService.updateEmailByResendId(
      resendId,
      {
        status: "complained",
      },
      this.qstashMailConfig.database
    );
  }

  public async processMailSuppressed(resendId: string): Promise<void> {
    await this.emailService.updateEmailByResendId(
      resendId,
      {
        status: "suppressed",
      },
      this.qstashMailConfig.database
    );
  }

  public async processMailDeliveryDelayed(resendId: string): Promise<void> {
    await this.emailService.updateEmailByResendId(
      resendId,
      {
        status: "delivered",
      },
      this.qstashMailConfig.database
    );
  }

  /** Mark the email record as delivered. */
  public async processMailDelivered(resendId: string): Promise<void> {
    await this.emailService.updateEmailByResendId(
      resendId,
      {
        status: "delivered",
      },
      this.qstashMailConfig.database
    );
  }

  // ─── Inbound mail ─────────────────────────────────────────────────────────

  /** Persist an inbound email and attach it to an existing thread when known. */
  public async processInboundEmail(
    payload: InboundEmailPayload
  ): Promise<InboundEmailResult> {
    try {
      const threadId = await this.resolveInboundThreadId(payload);

      const { emailId } = await this.emailService.createInboundEmailRecord(
        {
          ...payload,
          message_id: this.cleanMessageId(payload.message_id),
          threadId,
        },
        this.qstashMailConfig.database
      );

      return {
        success: true,
        emailId,
        threadId,
      };
    } catch (err) {
      return this.toErrorResult(err);
    }
  }

  /**
   * Resolve the thread an inbound mail belongs to by matching its
   * `In-Reply-To` header, then any `References` header, against previously
   * stored `resendMessageId`s.
   */
  private async resolveInboundThreadId(
    payload: InboundEmailPayload
  ): Promise<string | undefined> {
    const inReplyTo = payload.headers?.["in-reply-to"];

    if (inReplyTo) {
      const [originalEmail] = await this.qstashMailConfig.database
        .select({ threadId: EmailTable.threadId })
        .from(EmailTable)
        .where(eq(EmailTable.resendMessageId, this.cleanMessageId(inReplyTo)))
        .limit(1);

      if (originalEmail?.threadId) return originalEmail.threadId;
    }

    if (!payload.headers?.references) return undefined;

    const referenceIds = payload.headers.references
      .split(/\s+/)
      .map(this.cleanMessageId)
      .filter(Boolean);

    for (const refId of referenceIds) {
      const [email] = await this.qstashMailConfig.database
        .select({ threadId: EmailTable.threadId })
        .from(EmailTable)
        .where(eq(EmailTable.resendMessageId, refId))
        .limit(1);

      if (email?.threadId) return email.threadId;
    }

    return undefined;
  }
}

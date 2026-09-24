import { createHash } from "node:crypto";

import { eq } from "drizzle-orm";

import { EmailTable } from "@workspace/drizzle/schemas";
import {
  BullmqClientService,
  type BullmqClientServiceConfig,
  BullmqError,
  type IBullmqClientService,
} from "@workspace/lib/bullmq";
import { MailError } from "@workspace/lib/utils";

import type {
  BullmqMailConfig,
  BullmqMailResult,
  InboundEmailPayload,
  InboundEmailResult,
  SendMailBatchItem,
  SendMailOption,
} from "../types";
import { EmailService } from "./Email.service";
import { ThreadService } from "./Thread.service";

/** Queue/job keys the backend exposes for mail. */
const MAIL_QUEUE = "mail";
const MAIL_JOB = "send";

/** Default deduplication window (seconds) applied to sent mails. */
const DEFAULT_DEDUP_WINDOW_SECONDS = 300;

/** Everything needed to enqueue and finalize a single prepared mail. */
interface PreparedMail {
  /** Id of the persisted outbound email record. */
  emailId: string;
  /** Thread the mail belongs to, when not a system mail. */
  threadId?: string;
  /** Redis key used to suppress duplicates. */
  dedupKey: string;
}

export interface IBullmqMailService extends IBullmqClientService {
  processMailSent(resendId: string, resendMessageId: string): Promise<void>;
  processMailDelivered(resendId: string): Promise<void>;
  sendMail(
    options: SendMailOption,
    isSystemMail?: boolean
  ): Promise<BullmqMailResult>;
  sendMailBatch(items: SendMailBatchItem[]): Promise<BullmqMailResult[]>;
  processInboundEmail(
    payload: InboundEmailPayload
  ): Promise<InboundEmailResult>;
}

/**
 * BullMQ-backed mail producer.
 *
 * Mails are not sent inline: each `sendMail` / `sendMailBatch` call persists an
 * outbound record and enqueues a `mail/send` job carrying only `emailId` (+
 * optional `threadId`). The backend worker loads the record from the shared
 * database and performs the actual transport send.
 */
export abstract class BullmqMailService
  extends BullmqClientService
  implements IBullmqMailService
{
  protected readonly bullmqMailConfig: BullmqMailConfig & {
    dedupWindowSeconds: number;
  };
  private threadService: ThreadService;
  private emailService: EmailService;

  constructor(
    bullmqMailConfig: BullmqMailConfig,
    bullmqConfig: BullmqClientServiceConfig
  ) {
    super(bullmqConfig);
    this.bullmqMailConfig = this.normalizeBullmqMailConfig(bullmqMailConfig);

    this.threadService = new ThreadService(bullmqMailConfig.database);
    this.emailService = new EmailService(bullmqMailConfig.database);
  }

  // ─── Configuration & small helpers ────────────────────────────────────────

  /** Apply mail-specific defaults. */
  private normalizeBullmqMailConfig(
    config: BullmqMailConfig
  ): BullmqMailConfig & { dedupWindowSeconds: number } {
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
      .sort()
      .join(",");
    const hash = createHash("sha256")
      .update(`mail:${to}|${options.subject}`)
      .digest("hex")
      .slice(0, 32);
    return `mail:dedup:${hash}`;
  }

  /** Reject a mail when its dedup key is still within the dedup window. */
  private async checkDuplicate(key: string): Promise<void> {
    const exists = await this.bullmqMailConfig.redisClient.get(key);

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
    await this.bullmqMailConfig.redisClient.set(key, value, {
      ex: this.bullmqMailConfig.dedupWindowSeconds,
    });
  }

  /** Strip the surrounding angle brackets from a message id. */
  private cleanMessageId(messageId: string): string {
    return messageId.replace(/^<|>$/g, "");
  }

  // ─── Sending ──────────────────────────────────────────────────────────────

  /**
   * Persist and enqueue a single mail.
   *
   * @throws {MailError|BullmqError} for validation, rate-limit, dedup and
   * enqueue failures; other failures are returned as a failed result.
   */
  public async sendMail(
    options: SendMailOption,
    isSystemMail: boolean = true
  ): Promise<BullmqMailResult> {
    try {
      const mail = await this.prepareMail(options, isSystemMail);
      const result = await this.enqueue<{ emailId: string; threadId?: string }>(
        {
          queue: MAIL_QUEUE,
          job: MAIL_JOB,
          payload: { emailId: mail.emailId, threadId: mail.threadId },
          retries: 3,
        }
      );
      await this.finalizeMail(mail, result.messageId);

      return this.toSuccessResult(mail, result.messageId);
    } catch (err) {
      if (err instanceof MailError || err instanceof BullmqError) throw err;

      return this.toErrorResult(err);
    }
  }

  /**
   * Persist and enqueue several mails.
   *
   * Each item is validated, rate-limited, deduplicated and persisted before it
   * is enqueued. Items that fail during preparation are reported individually.
   *
   * @returns one {@link BullmqMailResult} per input item, in the same order.
   */
  public async sendMailBatch(
    items: SendMailBatchItem[]
  ): Promise<BullmqMailResult[]> {
    if (items.length === 0) return [];

    const results: BullmqMailResult[] = new Array(items.length);

    await Promise.all(
      items.map(async (item, index) => {
        try {
          const mail = await this.prepareMail(
            item.options,
            item.isSystemMail ?? true
          );
          const result = await this.enqueue<{
            emailId: string;
            threadId?: string;
          }>({
            queue: MAIL_QUEUE,
            job: MAIL_JOB,
            payload: { emailId: mail.emailId, threadId: mail.threadId },
            retries: 3,
          });

          await this.finalizeMail(mail, result.messageId);
          results[index] = this.toSuccessResult(mail, result.messageId);
        } catch (err) {
          if (err instanceof MailError || err instanceof BullmqError) {
            results[index] = this.toErrorResult(err);
            return;
          }
          results[index] = this.toErrorResult(err);
        }
      })
    );

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

    const dedupKey = this.generateMailDedupKey(options);
    await this.checkDuplicate(dedupKey);

    let threadId: string | undefined = undefined;
    if (!isSystemMail) {
      threadId = await this.threadService.findOrCreateThread({
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

  /** Link the enqueued BullMQ job back to the email record. */
  private async finalizeMail(
    mail: PreparedMail,
    messageId: string
  ): Promise<void> {
    await Promise.all([
      this.markProcessed(mail.dedupKey, messageId),
      this.bullmqMailConfig.database
        .update(EmailTable)
        .set({ qMessageId: messageId })
        .where(eq(EmailTable.id, mail.emailId)),
    ]);
  }

  /** Shape a successful enqueue into the public mail result. */
  private toSuccessResult(
    mail: PreparedMail,
    messageId: string
  ): BullmqMailResult {
    return {
      success: true,
      messageId,
      emailId: mail.emailId,
      threadId: mail.threadId,
    };
  }

  /** Shape a thrown value into a failed mail result. */
  private toErrorResult(err: unknown): BullmqMailResult {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
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
      this.bullmqMailConfig.database
    );
  }

  /** Mark the email record as delivered. */
  public async processMailDelivered(resendId: string): Promise<void> {
    await this.emailService.updateEmailByResendId(
      resendId,
      {
        status: "delivered",
      },
      this.bullmqMailConfig.database
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
        this.bullmqMailConfig.database
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
      const [originalEmail] = await this.bullmqMailConfig.database
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
      const [email] = await this.bullmqMailConfig.database
        .select({ threadId: EmailTable.threadId })
        .from(EmailTable)
        .where(eq(EmailTable.resendMessageId, refId))
        .limit(1);

      if (email?.threadId) return email.threadId;
    }

    return undefined;
  }
}

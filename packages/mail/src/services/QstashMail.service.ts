import { eq } from "drizzle-orm";
import { CreateEmailOptions } from "resend";

import { EmailTable } from "@workspace/drizzle/schemas";
import {
  IQstashService,
  QstashService,
  QstashServiceConfig,
} from "@workspace/lib/qstash";
import { QstashError } from "@workspace/lib/qstash/error";

import { MailError } from "../MailError";
import type {
  InboundEmailPayload,
  InboundEmailResult,
  MailCallbackPayload,
  QstashMailConfig,
  QstashMailResult,
  SendMailOption,
} from "../types";
import type { IMailTransport } from "../types";
import { EmailService } from "./Email.service";
import { ThreadService } from "./Thread.service";

export interface IQstashMailService extends IQstashService {
  processMailCallback(
    payload: SendMailOption,
    context: { messageId: string }
  ): Promise<void>;
  processInboundEmail(
    payload: InboundEmailPayload
  ): Promise<InboundEmailResult>;
  processMailSent(resendId: string, resendMessageId: string): Promise<void>;
  processMailDelivered(resendId: string): Promise<void>;
  sendMail(
    options: SendMailOption,
    isSystemMail?: boolean
  ): Promise<QstashMailResult>;
  handleMailReceipt(qMessageId: string): Promise<void>;
  handleMailFailure(qMessageId: string): Promise<void>;
  handleRetryMail(qMessageId: string): Promise<QstashMailResult>;
}

export abstract class QstashMailService
  extends QstashService
  implements IQstashMailService
{
  protected readonly qstashMailConfig: QstashMailConfig & {
    dedupWindowSeconds: number;
  };
  private threadService: ThreadService;
  private emailService: EmailService;

  constructor(
    protected readonly mailTransport: IMailTransport,
    qstashMailConfig: QstashMailConfig,
    qstashConfig: QstashServiceConfig
  ) {
    super(qstashConfig);
    this.qstashMailConfig = this.normalizeQstashMailConfig(qstashMailConfig);

    this.threadService = new ThreadService(qstashMailConfig.database);
    this.emailService = new EmailService(qstashMailConfig.database);

    this.registerCallbackHandler<MailCallbackPayload>(
      "mail",
      this.processMailCallback.bind(this)
    );
    this.registerReceiptHandler("mail", this.handleMailReceipt.bind(this));
  }

  private normalizeQstashMailConfig(
    config: QstashMailConfig
  ): QstashMailConfig & { dedupWindowSeconds: number } {
    return {
      ...config,
      dedupWindowSeconds: config.dedupWindowSeconds ?? 300,
    };
  }

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

  protected generateMessageId(emailId: string): string {
    return `${emailId}@${this.qstashMailConfig.domainName}`;
  }

  private generateMailDedupKey(options: SendMailOption): string {
    const to = this.emailService
      .normalizeRecipients(options.to)
      .map((r) => r.email)
      .sort()
      .join(",");
    return this.generateDedupKey(`mail:${to}|${options.subject}`, "mail");
  }

  private async checkRateLimit(recipient: string) {
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

  private async checkDuplicate(key: string) {
    const exists = await this.qstashMailConfig.redisClient.get(key);

    if (exists) {
      throw new MailError(
        "Duplicate email suppressed within dedup window.",
        "MAIL_DUPLICATE_SUPPRESSED",
        409
      );
    }
  }

  private async markProcessed(key: string, value: string): Promise<void> {
    await this.qstashMailConfig.redisClient.set(key, value, {
      ex: this.qstashMailConfig.dedupWindowSeconds,
    });
  }

  private cleanMessageId(messageId: string): string {
    return messageId.replace(/^<|>$/g, "");
  }

  public async sendMail(
    options: SendMailOption,
    isSystemMail: boolean = true
  ): Promise<QstashMailResult> {
    try {
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

      const { emailId, threadId, qMessageId, deduplicationId } =
        await this.qstashMailConfig.database.transaction(async (tx) => {
          let threadId: string | undefined = undefined;

          if (!isSystemMail) {
            const threadData = await this.threadService.findOrCreateThread(
              {
                threadId: options?.threadId,
                subject: `Te: ${options.subject}`,
                contactEmail: primaryRecipient.email,
                contactName: primaryRecipient?.name,
              },
              tx
            );

            threadId = threadData;
          }

          const { emailId } = await this.emailService.createOutboundEmailRecord(
            {
              options,
              threadId,
            },
            tx
          );

          const generatedMessageId = this.generateMessageId(emailId);
          const references = options.inReplyTo
            ? [...(options.references ?? []), options.inReplyTo]
            : options.references;

          const { messageId: qMessageId, deduplicationId } =
            await this.publish<MailCallbackPayload>({
              body: {
                ...options,
                headers: this.buildHeaders(
                  {
                    ...options.headers,
                    "Message-ID": `<${generatedMessageId}>`,
                  },
                  options.inReplyTo,
                  references
                ),
                emailId,
                threadId,
              },
              url: this.qstashMailConfig.callbackUrl,
              callback: this.qstashMailConfig.receiptCallbackUrl,
              failureCallback: this.qstashMailConfig.failureCallbackUrl,
              routeKey: "mail",
            });

          await tx
            .update(EmailTable)
            .set({
              qMessageId,
              resendMessageId: generatedMessageId,
            })
            .where(eq(EmailTable.id, emailId));

          await Promise.all([
            this.markProcessed(dedupKey, qMessageId),
            this.updateMessage(qMessageId, { deduplicationId }),
          ]);

          return { emailId, threadId, qMessageId, deduplicationId };
        });

      return { success: true, qMessageId, deduplicationId, emailId, threadId };
    } catch (err) {
      if (err instanceof MailError || err instanceof QstashError) throw err;

      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error occurred",
      };
    }
  }

  public async processMailCallback(
    payload: MailCallbackPayload,
    context: { messageId: string }
  ): Promise<void> {
    try {
      const resendId = await this.mailTransport.send({
        from: payload.from,
        to: payload.to,
        cc: payload.cc,
        bcc: payload.bcc,
        replyTo: payload.replyTo,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        attachments: payload.attachments,
        headers: payload.headers,
        topicId: payload.topicId,
        tags: payload.tags,
      } as CreateEmailOptions);

      await this.qstashMailConfig.database
        .update(EmailTable)
        .set({
          resendId: resendId,
        })
        .where(eq(EmailTable.qMessageId, context.messageId));
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

  public async handleMailReceipt(qMessageId: string): Promise<void> {
    await this.handleDeliveryReceipt(qMessageId, "mail");
  }

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

  public async handleRetryMail(qMessageId: string): Promise<QstashMailResult> {
    try {
      const result = await this.retryMessage(qMessageId, { routeKey: "mail" });
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

  public async processMailSent(resendId: string, resendMessageId: string) {
    await this.emailService.updateEmailByResendId(
      resendId,
      {
        status: "sent",
        resendMessageId: this.cleanMessageId(resendMessageId),
      },
      this.qstashMailConfig.database
    );
  }

  public async processMailDelivered(resendId: string) {
    await this.emailService.updateEmailByResendId(
      resendId,
      {
        status: "delivered",
      },
      this.qstashMailConfig.database
    );
  }

  public async processInboundEmail(
    payload: InboundEmailPayload
  ): Promise<InboundEmailResult> {
    try {
      let threadId: string | undefined = undefined;

      const inReplyTo = payload.headers?.["in-reply-to"];

      if (inReplyTo) {
        const [originalEmail] = await this.qstashMailConfig.database
          .select({ threadId: EmailTable.threadId })
          .from(EmailTable)
          .where(eq(EmailTable.resendMessageId, this.cleanMessageId(inReplyTo)))
          .limit(1);

        if (originalEmail?.threadId) {
          threadId = originalEmail.threadId;
        }
      }

      if (!threadId && payload.headers?.references) {
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

          if (email?.threadId) {
            threadId = email.threadId;
            break;
          }
        }
      }

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
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error occurred",
      };
    }
  }
}

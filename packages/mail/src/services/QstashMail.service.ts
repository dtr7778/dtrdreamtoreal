import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { render } from "react-email";
import { CreateEmailOptions } from "resend";

import { DatabaseType } from "@workspace/drizzle/client";
import {
  EmailEventTable,
  EmailTable,
  InsertEmailEvent,
} from "@workspace/drizzle/schemas";
import {
  EmailEventTypeEnumType,
  EmailStatusEnumType,
} from "@workspace/drizzle/zod-db-enums";
import {
  IQstashService,
  QstashService,
  QstashServiceConfig,
} from "@workspace/lib/qstash";
import { QstashError } from "@workspace/lib/qstash/error";

import { MailError } from "../MailError";
import type {
  EmailEventPayload,
  EventProcessResult,
  InboundEmailPayload,
  InboundEmailResult,
  MailCallbackPayload,
  MailSendResult,
  QstashMailConfig,
  QstashMailResult,
  SendMailOption,
  ThreadingOptions,
} from "../types";
import type { IMailTransport } from "../types";
import {
  createEmailRecord,
  extractPrimaryRecipient,
  normalizeRecipients,
  updateEmailAfterSend,
} from "./email-records";
import { processInboundEmail } from "./inbound";
import { updateThreadForOutbound } from "./threading";

export interface IQstashMailService extends IQstashService {
  sendMail(options: SendMailOption): Promise<QstashMailResult>;
  processMailCallback(
    payload: SendMailOption,
    context: { messageId: string }
  ): Promise<MailSendResult>;
  processEmailEvent(
    payload: EmailEventPayload,
    context: { messageId: string }
  ): Promise<EventProcessResult>;
  processInboundEmail(
    payload: InboundEmailPayload
  ): Promise<InboundEmailResult>;
  handleMailReceipt(messageId: string): Promise<void>;
  retryMail(messageId: string): Promise<QstashMailResult>;
}

export abstract class QstashMailService
  extends QstashService
  implements IQstashMailService
{
  protected readonly qstashMailConfig: QstashMailConfig & {
    dedupWindowSeconds: number;
  };

  constructor(
    protected readonly mailTransport: IMailTransport,
    protected readonly isSystemMail: boolean,
    qstashMailConfig: QstashMailConfig,
    qstashConfig: QstashServiceConfig,
    protected readonly fromMail: string
  ) {
    super(qstashConfig);
    this.qstashMailConfig = this.normalizeQstashMailConfig(qstashMailConfig);

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

  private generateMessageId(): string {
    const uuid = randomUUID();
    return `<${uuid}@${this.qstashMailConfig.domainName}>`;
  }

  private cleanMessageId(messageId: string): string {
    return messageId.replace(/^<|>$/g, "");
  }

  private buildReferences(
    existingReferences: string | null | undefined,
    inReplyTo: string | null | undefined,
    newMessageId: string
  ): string {
    const parts: string[] = [];

    if (existingReferences) {
      const ids = existingReferences
        .split(/\s+/)
        .map((id) => id.replace(/^<|>$/g, ""))
        .filter(Boolean);
      parts.push(...ids);
    }

    if (inReplyTo) {
      const parentId = inReplyTo.replace(/^<|>$/g, "");
      if (!parts.includes(parentId)) {
        parts.push(parentId);
      }
    }

    parts.push(newMessageId.replace(/^<|>$/g, ""));

    return parts.map((id) => `<${id}>`).join(" ");
  }

  protected buildThreadingHeaders(
    threading?: ThreadingOptions,
    messageId?: string
  ): Record<string, string> {
    const headers: Record<string, string> = {};

    if (messageId) {
      headers["Message-ID"] = messageId;
    }

    if (threading?.inReplyTo) {
      headers["In-Reply-To"] = `<${threading.inReplyTo}>`;
    }

    if (threading?.references || threading?.inReplyTo) {
      headers["References"] = this.buildReferences(
        threading?.references || null,
        threading?.inReplyTo ? `<${threading.inReplyTo}>` : null,
        messageId || ""
      );
    }

    return headers;
  }

  private generateMailDedupKey(options: SendMailOption): string {
    const to = normalizeRecipients(options.to)
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

  private getEventToStatus(
    eventType: EmailEventTypeEnumType
  ): EmailStatusEnumType {
    const obj: Record<EmailEventTypeEnumType, EmailStatusEnumType> = {
      "email.sent": "sent",
      "email.delivered": "delivered",
      "email.delivery_delayed": "sent",
      "email.bounced": "bounced",
      "email.complained": "complained",
      "email.opened": "delivered",
      "email.clicked": "delivered",
      "email.unsubscribed": "delivered",
      "email.rejected": "failed",
    };

    return obj[eventType];
  }

  public async processEmailEvent(
    payload: EmailEventPayload
  ): Promise<EventProcessResult> {
    const { eventType, eventData } = payload;
    const resendEmailId = eventData.email_id as string;

    if (!resendEmailId) {
      return { success: false, error: "No email_id in payload" };
    }

    const [email] = await this.qstashMailConfig.database
      .select({
        id: EmailTable.id,
        resendId: EmailTable.resendId,
        status: EmailTable.status,
      })
      .from(EmailTable)
      .where(eq(EmailTable.resendId, resendEmailId))
      .limit(1);

    if (!email) {
      return { success: false, error: "Email not found" };
    }

    const newStatus = this.getEventToStatus(eventType);

    await this.qstashMailConfig.database.transaction(async (tx) => {
      if (newStatus && email.status !== newStatus) {
        await tx
          .update(EmailTable)
          .set({ status: newStatus })
          .where(eq(EmailTable.id, email.id));
      }

      const [emailEvent] = await tx
        .insert(EmailEventTable)
        .values({
          emailId: email.id,
          eventType,
          resendEventId: `${eventType}_${resendEmailId}`,
          data: eventData,
          url: (eventData.url as string) || null,
          ip: (eventData.ip as string) || null,
          userAgent: (eventData.user_agent as string) || null,
          bounceReason: (eventData.bounce_reason as string) || null,
          bounceType: (eventData.bounce_type as string) || null,
          bounceCode: (eventData.bounce_code as string) || null,
          occurredAt: new Date(eventData.created_at as string),
        } satisfies InsertEmailEvent)
        .returning({ id: EmailEventTable.id });

      if (!emailEvent) {
        throw new Error("Failed to create email event");
      }

      await this.handleEventSideEffects(
        tx,
        eventType,
        emailEvent.id,
        eventData
      );
    });

    return { success: true, emailId: email.id, eventType, newStatus };
  }

  private async handleEventSideEffects(
    database: DatabaseType,
    eventType: string,
    emailEventId: string,
    eventData: Record<string, unknown>
  ): Promise<void> {
    switch (eventType) {
      case "email.bounced":
        await this.handleBounce(database, emailEventId, eventData);
        break;
    }
  }

  private async handleBounce(
    database: DatabaseType,
    emailEventId: string,
    eventData: Record<string, unknown>
  ): Promise<void> {
    const bounceType = eventData.bounce_type as
      | "hard"
      | "soft"
      | "undetermined";
    const bounceReason = eventData.bounce_reason as string;
    const bounceCode = eventData.bounce_code as string;

    await database
      .update(EmailEventTable)
      .set({ bounceType, bounceCode, bounceReason })
      .where(eq(EmailEventTable.id, emailEventId));
  }

  protected async sendMailTemplate(
    to: SendMailOption["to"],
    subject: string,
    component: React.ReactNode,
    options: Partial<SendMailOption> = {}
  ): Promise<QstashMailResult> {
    const html = await render(component);
    const text = await render(component, { plainText: true });

    return this.sendMail({
      ...options,
      from: this.fromMail,
      to,
      subject,
      text,
      html,
    });
  }

  public async sendMail(options: SendMailOption): Promise<QstashMailResult> {
    try {
      if (!options.html && !options.text) {
        throw new MailError(
          "Either 'html' or 'text' must be provided",
          "MAIL_INVALID_PAYLOAD",
          400
        );
      }

      const primaryRecipient = extractPrimaryRecipient(options.to);
      await this.checkRateLimit(primaryRecipient);

      const dedupKey = this.generateMailDedupKey(options);
      await this.checkDuplicate(dedupKey);

      const messageId = this.generateMessageId();
      const cleanMessageId = this.cleanMessageId(messageId);

      const { emailId, threadId, qMessageId, deduplicationId } =
        await this.qstashMailConfig.database.transaction(async (tx) => {
          const { threadId } = await updateThreadForOutbound(tx, {
            threadId: options.threadId,
            subject: `Re: ${options.subject}`,
            contactEmail: primaryRecipient,
          });

          const { emailId } = await createEmailRecord(tx, {
            options,
            threadId,
            messageId,
            cleanMessageId,
            direction: "outbound",
            buildThreadingHeaders: this.buildThreadingHeaders.bind(this),
          });

          const { messageId: qMessageId, deduplicationId } =
            await this.publish<MailCallbackPayload>({
              url: this.qstashMailConfig.callbackUrl,
              body: {
                ...options,
                to: options.to,
                cc: options.cc,
                bcc: options.bcc,
                replyTo: options.replyTo,
                subject: options.subject,
                html: options.html!,
                text: options.text!,
                attachments: options.attachments,
                headers: {
                  ...options.headers,
                  ...this.buildThreadingHeaders(options.threading, messageId),
                },
                emailId,
                threadId,
                messageId,
                deduplicationId: "",
                cleanMessageId,
              },
              callback: this.qstashMailConfig.receiptCallbackUrl,
              failureCallback: this.qstashMailConfig.failureCallbackUrl,
              routeKey: "mail",
            });

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
  ): Promise<MailSendResult> {
    try {
      const result = await this.mailTransport.send({
        ...payload,
      } as CreateEmailOptions);

      await updateEmailAfterSend(
        this.qstashMailConfig.database,
        payload.emailId,
        result
      );

      return result;
    } catch (error) {
      throw new MailError(
        error instanceof Error ? error.message : "Unknown error occurred",
        "MAIL_TRANSPORT_FAILED",
        500,
        { messageId: context.messageId }
      );
    }
  }

  public async handleMailReceipt(messageId: string): Promise<void> {
    await this.handleDeliveryReceipt(messageId, "mail");
  }

  public async retryMail(messageId: string): Promise<QstashMailResult> {
    try {
      const result = await this.retryMessage(messageId, { routeKey: "mail" });
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
        { messageId }
      );
    }
  }

  public async processInboundEmail(
    payload: InboundEmailPayload
  ): Promise<InboundEmailResult> {
    return processInboundEmail(this.qstashMailConfig.database, payload);
  }
}

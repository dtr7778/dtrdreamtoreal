import { CreateEmailOptions } from "resend";

import {
  IQstashService,
  QstashService,
  QstashServiceConfig,
} from "@workspace/lib/qstash";
import { QstashError } from "@workspace/lib/qstash/error";

import { MailError } from "./MailError";
import type {
  MailCallbackPayload,
  MailSendResult,
  QstashMailConfig,
  QstashMailResult,
  SendMailOption,
} from "./types";
import type { IMailTransport } from "./types";

export interface IQstashMailService extends IQstashService {
  sendMail(
    options: SendMailOption,
    metadata?: {
      createdBy?: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<QstashMailResult>;
  processMailCallback(
    payload: SendMailOption,
    context: {
      messageId: string;
    }
  ): Promise<MailSendResult>;
  handleMailReceipt(
    messageId: Parameters<IQstashService["handleDeliveryReceipt"]>[0]
  ): Promise<void>;
  retryMail(messageId: string): Promise<QstashMailResult>;
}

export abstract class QstashMailService
  extends QstashService
  implements IQstashMailService
{
  private readonly qstashMailConfig: QstashMailConfig & {
    dedupWindowSeconds: number;
  };

  constructor(
    private readonly mailTransport: IMailTransport,
    qstashMailConfig: QstashMailConfig,
    qstashConfig: QstashServiceConfig
  ) {
    super(qstashConfig);
    this.qstashMailConfig = this.normalizeQstashMailConfig(qstashMailConfig);

    this.registerCallbackHandler<SendMailOption>(
      "mail",
      this.processMailCallback.bind(this)
    );
    this.registerReceiptHandler("mail", this.handleMailReceipt.bind(this));
  }

  private normalizeQstashMailConfig(
    config: QstashMailConfig
  ): QstashMailConfig & {
    dedupWindowSeconds: number;
  } {
    return {
      ...config,
      dedupWindowSeconds: config.dedupWindowSeconds ?? 300,
    };
  }

  private generateMailDedupKey(options: SendMailOption): string {
    const to = Array.isArray(options.to)
      ? [...options.to].sort().join(",")
      : options.to;
    return this.generateDedupKey(`mail:${to}|${options.subject}`, "mail");
  }

  private async checkMailRateLimit(recipient: string) {
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

  private extractPrimaryRecipient(to: SendMailOption["to"]): string {
    const recipient = Array.isArray(to) ? to[0] : to;
    if (!recipient) {
      throw new MailError(
        "No valid recipient provided",
        "MAIL_RECIPIENT_INVALID",
        400
      );
    }
    return recipient;
  }

  private async isDuplicate(key: string): Promise<boolean> {
    return (await this.qstashMailConfig.redisClient.get(key)) !== null;
  }

  private async markProcessed(key: string, value: string): Promise<void> {
    await this.qstashMailConfig.redisClient.set(key, value, {
      ex: this.qstashMailConfig.dedupWindowSeconds,
    });
  }

  public async sendMail(
    options: SendMailOption,
    metadata?: { createdBy?: string; ipAddress?: string; userAgent?: string }
  ): Promise<QstashMailResult> {
    try {
      if (!options.html && !options.text) {
        throw new MailError(
          "Either 'html' or 'text' must be provided",
          "MAIL_INVALID_PAYLOAD",
          400
        );
      }

      const recipient = this.extractPrimaryRecipient(options.to);

      await this.checkMailRateLimit(recipient);

      const dedupKey = this.generateMailDedupKey(options);
      const isDuplicate = await this.isDuplicate(dedupKey);

      if (isDuplicate) {
        throw new MailError(
          "Duplicate email suppressed within dedup window.",
          "MAIL_DUPLICATE_SUPPRESSED",
          409
        );
      }

      const emailPayload = {
        ...options,
        messageId: "",
        deduplicationId: "",
        to: options.to,
        subject: options.subject,
        from: `"${this.qstashMailConfig.appName}" <${this.qstashMailConfig.fromEmail}>`,
        ...metadata,
      };

      const { messageId: messageId, deduplicationId } =
        await this.publish<MailCallbackPayload>({
          url: this.qstashMailConfig.callbackUrl,
          body: emailPayload,
          callback: this.qstashMailConfig.receiptCallbackUrl,
          failureCallback: this.qstashMailConfig.failureCallbackUrl,
          routeKey: "mail",
        });

      await Promise.all([
        this.markProcessed(dedupKey, messageId),
        this.updateMessage(messageId, {
          deduplicationId,
        }),
      ]);

      return { success: true, messageId, deduplicationId };
    } catch (err) {
      if (err instanceof MailError || err instanceof QstashError) throw err;

      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error occurred",
      };
    }
  }

  public async processMailCallback(
    payload: SendMailOption,
    context: { messageId: string }
  ): Promise<MailSendResult> {
    try {
      const options: CreateEmailOptions = {
        ...payload,
        from: `"${this.qstashMailConfig.appName}" <${this.qstashMailConfig.fromEmail}>`,
      };

      return this.mailTransport.send(options);
    } catch (error) {
      throw new MailError(
        error instanceof Error ? error.message : "Unknown error occurred",
        "MAIL_TRANSPORT_FAILED",
        500,
        { messageId: context.messageId }
      );
    }
  }

  public async handleMailReceipt(
    messageId: Parameters<IQstashService["handleDeliveryReceipt"]>[0]
  ): Promise<void> {
    await this.handleDeliveryReceipt(messageId, "mail");
  }

  public async retryMail(messageId: string): Promise<QstashMailResult> {
    try {
      const result = await this.retryMessage(messageId, {
        routeKey: "mail",
      });
      return {
        success: true,
        messageId: result.messageId,
        deduplicationId: result.deduplicationId,
      };
    } catch (err) {
      if (err instanceof QstashError || err instanceof QstashError) {
        throw err;
      }
      throw new MailError(
        err instanceof Error ? err.message : "Unknown error occurred",
        "MAIL_TRANSPORT_FAILED",
        500,
        { messageId }
      );
    }
  }
}

import type { DatabaseType } from "@workspace/drizzle/client";
import type { LoggerType } from "@workspace/lib/logger";

import { mailQueueEnvelopeSchema } from "../producer/schema";
import { EmailService } from "../services/Email.service";
import type { IMailTransport } from "../transports";

interface MailQueueMessageLike {
  id: string;
  body: unknown;
  ack(): void;
  retry(): void;
}

interface MailQueueBatchLike {
  queue: string;
  messages: readonly MailQueueMessageLike[];
}

export type MailProcessStatus = "sent" | "skipped" | "invalid";

export interface MailProcessResult {
  status: MailProcessStatus;
  emailId?: string;
  resendId?: string;
}

export class MailQueueProcessor {
  constructor(
    private readonly database: DatabaseType,
    private readonly transport: IMailTransport,
    private readonly logger: LoggerType
  ) {}

  async processMessage(body: unknown): Promise<MailProcessResult> {
    const parsed = mailQueueEnvelopeSchema.safeParse(body);

    if (!parsed.success) {
      this.logger.error(
        { issues: parsed.error.issues },
        "mail.queue.invalid_payload"
      );

      return { status: "invalid" };
    }

    const { emailId } = parsed.data;
    const emailService = new EmailService(this.database);

    const email = await emailService.getEmailById(emailId);

    if (!email) {
      this.logger.warn({ emailId }, "mail.queue.email_not_found");

      return { status: "invalid", emailId };
    }

    if (email.status === "sent") {
      this.logger.info({ emailId }, "mail.queue.already_sent");

      return { status: "skipped", emailId };
    }

    try {
      const options = await emailService.buildOutboundEmailOptions(emailId);
      const resendId = await this.transport.send(options);

      await emailService
        .updateEmailById(emailId, { status: "sent", resendId })
        .catch((error: unknown) => {
          this.logger.error(
            { emailId, error },
            "mail.queue.status_update_failed"
          );
        });

      this.logger.info({ emailId, resendId }, "mail.queue.sent");

      return { status: "sent", emailId, resendId };
    } catch (error) {
      await emailService
        .updateEmailById(emailId, { status: "failed" })
        .catch(() => undefined);

      this.logger.error({ emailId, error }, "mail.queue.send_failed");

      throw error;
    }
  }

  async handleBatch(batch: MailQueueBatchLike): Promise<void> {
    for (const message of batch.messages) {
      try {
        await this.processMessage(message.body);
        message.ack();
      } catch (error) {
        this.logger.warn({ messageId: message.id, error }, "mail.queue.retry");
        message.retry();
      }
    }
  }
}

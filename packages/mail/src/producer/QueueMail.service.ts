import type { DatabaseType } from "@workspace/drizzle/client";

import { EmailService } from "../services/Email.service";
import { EmailThreadService } from "../services/EmailThread.service";
import type { QueueMailResult, SendMailOption } from "../types";
import {
  type MailQueueEnvelope,
  type MailQueueEnvelopeInput,
  mailQueueEnvelopeSchema,
} from "./schema";

export interface MailQueueProducer {
  send(
    message: MailQueueEnvelope,
    options?: { contentType?: string; delaySeconds?: number }
  ): Promise<unknown>;
}

export interface IQueueMailService {
  sendMail(
    options: SendMailOption,
    isSystemMail?: boolean
  ): Promise<QueueMailResult>;
}

export interface QueueMailServiceConfig {
  database: DatabaseType;
  queue: MailQueueProducer;
}

export class QueueMailService implements IQueueMailService {
  private readonly queue: MailQueueProducer;
  private readonly emailService: EmailService;
  private readonly emailThreadService: EmailThreadService;

  constructor(config: QueueMailServiceConfig) {
    this.queue = config.queue;
    this.emailService = new EmailService(config.database);
    this.emailThreadService = new EmailThreadService(config.database);
  }

  private async enqueueMailJob(input: MailQueueEnvelopeInput): Promise<void> {
    const envelope = mailQueueEnvelopeSchema.parse(input);
    await this.queue.send(envelope);
  }

  public async sendMail(
    options: SendMailOption,
    isSystemMail = true
  ): Promise<QueueMailResult> {
    let emailId: string | undefined;

    try {
      const primaryRecipient = this.emailService.extractPrimaryRecipient(
        options.to
      );

      const threadId = await this.emailThreadService.findOrCreateThread({
        threadId: options.threadId,
        contactEmail: primaryRecipient.email,
        contactName: primaryRecipient.name,
        subject: `Re: ${options.subject}`,
      });

      const created = await this.emailService.createOutboundEmailRecord({
        options,
        threadId,
      });
      emailId = created.emailId;

      await this.enqueueMailJob({
        emailId,
        threadId,
        isSystemMail,
        queuedAt: Date.now(),
      });

      return { success: true, emailId, threadId };
    } catch (error) {
      if (emailId) {
        await this.emailService
          .updateEmailById(emailId, { status: "failed" })
          .catch(() => undefined);
      }

      return {
        success: false,
        emailId,
        error: error instanceof Error ? error.message : "Unknown mail error",
      };
    }
  }
}

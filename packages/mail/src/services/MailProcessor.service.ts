import { eq } from "drizzle-orm";

import { DatabaseType } from "@workspace/drizzle/client";
import { EmailTable } from "@workspace/drizzle/schemas";

import { ResendMailTransport } from "../transports/ResendMail.transport";
import type {
  IMailTransport,
  InboundEmailPayload,
  InboundEmailResult,
} from "../types";
import { EmailService } from "./Email.service";

export interface IMailProcessor {
  /** Load a persisted outbound email and send it through the transport. */
  sendPersistedEmail(emailId: string): Promise<{ resendId: string }>;
  /** Persist a received inbound email. */
  processInboundEmail(
    payload: InboundEmailPayload
  ): Promise<InboundEmailResult>;
  /** Mark an outbound email as sent using the transport ids. */
  processMailSent(resendId: string, resendMessageId: string): Promise<void>;
  /** Mark an outbound email as delivered. */
  processMailDelivered(resendId: string): Promise<void>;
  /** Mark an outbound email as failed. */
  processMailFailed(resendId: string): Promise<void>;
}

/**
 * Backend-side mail processor.
 *
 * Owns the transport and turns a persisted email id into an actual send,
 * storing the transport message id on the shared email record. It also handles
 * the inbound/status webhooks that used to run inside the web app.
 */
export class MailProcessorService implements IMailProcessor {
  private readonly emailService: EmailService;

  constructor(
    private readonly database: DatabaseType,
    private readonly transport: IMailTransport
  ) {
    this.emailService = new EmailService(database);
  }

  public async sendPersistedEmail(
    emailId: string
  ): Promise<{ resendId: string }> {
    const options = await this.emailService.buildOutboundEmailOptions(emailId);

    const resendId = await this.transport.send(options);

    await this.database
      .update(EmailTable)
      .set({ resendId })
      .where(eq(EmailTable.id, emailId));

    return { resendId };
  }

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
        this.database
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
      this.database
    );
  }

  public async processMailDelivered(resendId: string): Promise<void> {
    await this.emailService.updateEmailByResendId(
      resendId,
      {
        status: "delivered",
      },
      this.database
    );
  }

  /** Strip the surrounding angle brackets from a message id. */
  private cleanMessageId(messageId: string): string {
    return messageId.replace(/^<|>$/g, "");
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
      const [originalEmail] = await this.database
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
      const [email] = await this.database
        .select({ threadId: EmailTable.threadId })
        .from(EmailTable)
        .where(eq(EmailTable.resendMessageId, refId))
        .limit(1);

      if (email?.threadId) return email.threadId;
    }

    return undefined;
  }

  public async processMailFailed(resendId: string): Promise<void> {
    await this.emailService.updateEmailByResendId(
      resendId,
      {
        status: "failed",
      },
      this.database
    );
  }
}

/**
 * Build a {@link MailProcessorService} from a database and a Resend API key.
 */
export function createMailProcessor(config: {
  database: DatabaseType;
  resendApiKey: string;
}): IMailProcessor {
  return new MailProcessorService(
    config.database,
    new ResendMailTransport(config.resendApiKey)
  );
}

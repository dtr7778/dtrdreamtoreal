import { eq } from "drizzle-orm";

import { DatabaseType } from "@workspace/drizzle/client";
import {
  EmailAttachmentTable,
  EmailRecipientTable,
  EmailTable,
  InsertEmail,
  InsertEmailAttachment,
  InsertEmailRecipient,
  UpdateEmail,
} from "@workspace/drizzle/schemas";

import { InboundEmailPayload, SendMailOption } from "../types";

export interface RecipientInfo {
  email: string;
  name?: string;
}

export class EmailService {
  constructor(private readonly database: DatabaseType) {}

  private resolveDB(database?: DatabaseType): DatabaseType {
    return database ?? this.database;
  }

  public normalizeRecipient(recipient: string): RecipientInfo {
    const match = recipient.match(/^"?([^"]+)"?\s*<([^>]+)>$/);
    if (match) {
      const name = match[1]?.trim();
      const email = match[2]?.trim().toLowerCase();
      if (!email) {
        throw new Error("Failed to parse 'email'");
      }
      return { name, email };
    }
    return { email: recipient.trim().toLowerCase() };
  }

  public normalizeRecipients(
    recipients: string | string[] | null | undefined
  ): RecipientInfo[] {
    if (!recipients) return [];
    if (Array.isArray(recipients)) {
      return recipients.map(this.normalizeRecipient);
    }
    return [this.normalizeRecipient(recipients)];
  }

  public extractPrimaryRecipient(to: string | string[]): RecipientInfo {
    const recipients = this.normalizeRecipients(to);
    const recipient = recipients[0];
    if (!recipient) {
      throw new Error("No valid recipient provided");
    }
    return recipient;
  }

  public async createOutboundEmailRecord(
    params: {
      options: SendMailOption;
      threadId: string | undefined;
      status?: string;
    },
    database?: DatabaseType
  ): Promise<{ emailId: string; threadId: string | undefined }> {
    const db = this.resolveDB(database);
    const { options, threadId } = params;

    const fromRecipient = this.normalizeRecipient(options.from);
    const recipients = this.normalizeRecipients(options.to);
    const ccRecipients = this.normalizeRecipients(options.cc);
    const bccRecipients = this.normalizeRecipients(options.bcc);
    const replyToRecipients = this.normalizeRecipients(options.replyTo);

    return db.transaction(async (tx) => {
      const [email] = await tx
        .insert(EmailTable)
        .values({
          threadId,
          direction: "outbound",
          status: "queued",
          subject: options.subject,
          textBody: options.text,
          htmlBody: options.html,
        } satisfies InsertEmail)
        .returning({ id: EmailTable.id });

      if (!email) {
        throw new Error("Failed to create email");
      }

      const recipientRows: InsertEmailRecipient[] = [
        {
          emailId: email.id,
          type: "from" as const,
          email: fromRecipient.email,
          name: fromRecipient.name,
        },
        ...recipients.map((r) => ({
          emailId: email.id,
          type: "to" as const,
          email: r.email,
          name: r.name,
        })),
        ...ccRecipients.map((r) => ({
          emailId: email.id,
          type: "cc" as const,
          email: r.email,
          name: r.name,
        })),
        ...bccRecipients.map((r) => ({
          emailId: email.id,
          type: "bcc" as const,
          email: r.email,
          name: r.name,
        })),
        ...replyToRecipients.map((r) => ({
          emailId: email.id,
          type: "reply_to" as const,
          email: r.email,
          name: r.name,
        })),
      ];

      if (recipientRows.length > 0) {
        await tx.insert(EmailRecipientTable).values(recipientRows);
      }

      if (options.attachments?.length) {
        await tx.insert(EmailAttachmentTable).values(
          options.attachments.map(
            (a) =>
              ({
                emailId: email.id,
                filename: `${a.filename}`,
                contentType: `${a.contentType}`,
                contentId: a.contentId,
              }) satisfies InsertEmailAttachment
          )
        );
      }

      return { emailId: email.id, threadId };
    });
  }

  public async createInboundEmailRecord(
    params: InboundEmailPayload & {
      threadId?: string | undefined;
    },
    database?: DatabaseType
  ): Promise<{ emailId: string }> {
    const db = this.resolveDB(database);

    const fromRecipient = this.normalizeRecipient(params.from);
    const recipients = this.normalizeRecipients(params.to);
    const ccRecipients = this.normalizeRecipients(params.cc);
    const bccRecipients = this.normalizeRecipients(params.bcc);
    const replyToRecipients = this.normalizeRecipients(params.reply_to);
    const receivedForRecipients = this.normalizeRecipients(params.received_for);

    return db.transaction(async (tx) => {
      const [email] = await tx
        .insert(EmailTable)
        .values({
          threadId: params?.threadId,
          direction: "inbound",
          status: "delivered",
          subject: params.subject,
          textBody: params.text,
          htmlBody: params.html,
          headers: params.headers,
          resendId: params.id,
          resendMessageId: params.message_id,
        } satisfies InsertEmail)
        .returning({ id: EmailTable.id });

      if (!email) {
        throw new Error("Failed to create email");
      }
      const recipientRows: InsertEmailRecipient[] = [
        {
          emailId: email.id,
          type: "from" as const,
          email: fromRecipient.email,
          name: fromRecipient.name,
        },
        ...recipients.map((r) => ({
          emailId: email.id,
          type: "to" as const,
          email: r.email,
          name: r.name,
        })),
        ...ccRecipients.map((r) => ({
          emailId: email.id,
          type: "cc" as const,
          email: r.email,
          name: r.name,
        })),
        ...bccRecipients.map((r) => ({
          emailId: email.id,
          type: "bcc" as const,
          email: r.email,
          name: r.name,
        })),
        ...replyToRecipients.map((r) => ({
          emailId: email.id,
          type: "reply_to" as const,
          email: r.email,
          name: r.name,
        })),
        ...receivedForRecipients.map((r) => ({
          emailId: email.id,
          type: "received_for" as const,
          email: r.email,
          name: r.name,
        })),
      ];

      await tx.insert(EmailRecipientTable).values(recipientRows);

      if (params.attachments?.length) {
        await tx.insert(EmailAttachmentTable).values(
          params.attachments.map(
            (a) =>
              ({
                emailId: email.id,
                filename: `${a.filename}`,
                contentType: a.content_type,
                contentId: a.content_id,
                contentDisposition: a.content_disposition,
                size: a.size,
              }) satisfies InsertEmailAttachment
          )
        );
      }

      return { emailId: email.id };
    });
  }

  public async updateEmailByResendId(
    resendId: string,
    params: UpdateEmail,
    database?: DatabaseType
  ) {
    const db = this.resolveDB(database);

    await db
      .update(EmailTable)
      .set(params)
      .where(eq(EmailTable.resendId, resendId));
  }
}

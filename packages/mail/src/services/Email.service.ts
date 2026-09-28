import { eq } from "drizzle-orm";
import type { CreateEmailOptions } from "resend";

import {
  EmailAttachmentTable,
  EmailRecipientTable,
  EmailTable,
  InsertEmail,
  InsertEmailAttachment,
  InsertEmailRecipient,
  UpdateEmail,
} from "@workspace/drizzle/schemas";
import { DatabaseType } from "@workspace/drizzle/types";

import { InboundEmailPayload, SendMailOption } from "../types";

/** Recipient kinds persisted in {@link EmailRecipientTable}. */
type RecipientType = "from" | "to" | "cc" | "bcc" | "reply_to" | "received_for";

export interface RecipientInfo {
  email: string;
  name?: string;
}

export interface IEmailService {
  normalizeRecipient(recipient: string): RecipientInfo;
  normalizeRecipients(
    recipients: string | string[] | null | undefined
  ): RecipientInfo[];
  extractPrimaryRecipient(to: string | string[]): RecipientInfo;
  buildOutboundEmailOptions(emailId: string): Promise<CreateEmailOptions>;
  createInboundEmailRecord(
    params: InboundEmailPayload & {
      threadId?: string | undefined;
    },
    database?: DatabaseType
  ): Promise<{
    emailId: string;
  }>;
  updateEmailByResendId(
    resendId: string,
    params: UpdateEmail,
    database?: DatabaseType
  ): Promise<void>;
  updateEmailById(
    id: string,
    params: UpdateEmail,
    database?: DatabaseType
  ): Promise<void>;
}

export class EmailService implements IEmailService {
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

    const metadata = this.buildOutboundMetadata(options);

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
          headers: options.headers,
          metadata,
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
                url: a.path,
              }) satisfies InsertEmailAttachment
          )
        );
      }

      return { emailId: email.id, threadId };
    });
  }

  /** Persist the send options that are not already covered by table columns. */
  private buildOutboundMetadata(
    options: SendMailOption
  ): Record<string, unknown> | undefined {
    const metadata: Record<string, unknown> = {};

    if (options.tags) metadata.tags = options.tags;
    if (options.topicId) metadata.topicId = options.topicId;
    if (options.scheduledAt) metadata.scheduledAt = options.scheduledAt;

    return Object.keys(metadata).length > 0 ? metadata : undefined;
  }

  /** Format a persisted recipient back into an RFC 5322 address. */
  private formatAddress(recipient: {
    email: string;
    name: string | null;
  }): string {
    return recipient.name
      ? `${recipient.name} <${recipient.email}>`
      : recipient.email;
  }

  /**
   * Rebuild the {@link CreateEmailOptions} for an outbound email from its
   * persisted record. Used by the QStash callback to send a mail without
   * embedding its content in the published message.
   */
  public async buildOutboundEmailOptions(
    emailId: string
  ): Promise<CreateEmailOptions> {
    const [email] = await this.database
      .select({
        subject: EmailTable.subject,
        textBody: EmailTable.textBody,
        htmlBody: EmailTable.htmlBody,
        headers: EmailTable.headers,
        metadata: EmailTable.metadata,
      })
      .from(EmailTable)
      .where(eq(EmailTable.id, emailId))
      .limit(1);

    if (!email) {
      throw new Error(`Outbound email not found: ${emailId}`);
    }

    const [recipients, attachments] = await Promise.all([
      this.database
        .select()
        .from(EmailRecipientTable)
        .where(eq(EmailRecipientTable.emailId, emailId)),
      this.database
        .select()
        .from(EmailAttachmentTable)
        .where(eq(EmailAttachmentTable.emailId, emailId)),
    ]);

    const byType = (type: RecipientType) =>
      recipients
        .filter((r) => r.type === type)
        .map((r) => this.formatAddress(r));

    const from = byType("from")[0];
    if (!from) {
      throw new Error(`Outbound email ${emailId} has no sender`);
    }

    const to = byType("to");
    const cc = byType("cc");
    const bcc = byType("bcc");
    const replyTo = byType("reply_to");
    const metadata = email.metadata ?? {};

    return {
      from,
      to,
      cc: cc.length > 0 ? cc : undefined,
      bcc: bcc.length > 0 ? bcc : undefined,
      replyTo: replyTo.length > 0 ? replyTo : undefined,
      subject: email.subject ?? "",
      text: email.textBody ?? undefined,
      html: email.htmlBody ?? undefined,
      headers: email.headers ?? undefined,
      attachments:
        attachments.length > 0
          ? attachments.map((a) => ({
              filename: a.filename,
              contentType: a.contentType ?? undefined,
              contentId: a.contentId ?? undefined,
              path: a.url ?? undefined,
            }))
          : undefined,
      tags: metadata.tags as CreateEmailOptions["tags"],
      topicId: (metadata.topicId as string | undefined) ?? undefined,
      scheduledAt: metadata.scheduledAt as string | undefined,
    } as CreateEmailOptions;
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
  ): Promise<void> {
    const db = this.resolveDB(database);

    await db
      .update(EmailTable)
      .set(params)
      .where(eq(EmailTable.resendId, resendId));
  }

  public async updateEmailById(
    id: string,
    params: UpdateEmail,
    database?: DatabaseType
  ): Promise<void> {
    const db = this.resolveDB(database);

    await db.update(EmailTable).set(params).where(eq(EmailTable.id, id));
  }
}

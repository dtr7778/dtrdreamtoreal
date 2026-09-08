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

import type { MailSendResult, SendMailOption } from "../types";

export interface RecipientInfo {
  email: string;
  name?: string;
}

export function normalizeRecipient(recipient: string): RecipientInfo {
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

export function normalizeRecipients(
  recipients: string | string[] | undefined
): RecipientInfo[] {
  if (!recipients) return [];
  if (Array.isArray(recipients)) {
    return recipients.map(normalizeRecipient);
  }
  return [normalizeRecipient(recipients)];
}

export function extractPrimaryRecipient(to: SendMailOption["to"]): string {
  const recipients = normalizeRecipients(to);
  const recipient = recipients[0]?.email;
  if (!recipient) {
    throw new Error("No valid recipient provided");
  }
  return recipient;
}

export async function createEmailRecord(
  database: DatabaseType,
  params: {
    options: SendMailOption;
    threadId: string | undefined;
    messageId: string;
    cleanMessageId: string;
    direction: "outbound" | "inbound" | "web_form";
    status?: string;
    buildThreadingHeaders: (
      threading?: SendMailOption["threading"],
      messageId?: string
    ) => Record<string, string>;
  }
): Promise<{ emailId: string; threadId: string | undefined }> {
  const {
    options,
    threadId,
    messageId,
    cleanMessageId,
    direction,
    buildThreadingHeaders,
  } = params;

  const recipients = normalizeRecipients(options.to);
  const ccRecipients = normalizeRecipients(options.cc);
  const replyToRecipients = normalizeRecipients(options.replyTo);

  return database.transaction(async (tx) => {
    const threadingHeaders = buildThreadingHeaders(
      options.threading,
      messageId
    );

    const [email] = await tx
      .insert(EmailTable)
      .values({
        threadId,
        direction,
        status: direction === "outbound" ? "queued" : "delivered",
        subject: options.subject,
        textBody: options.text,
        htmlBody: options.html,
        messageId: cleanMessageId,
        inReplyTo: options.threading?.inReplyTo || null,
        references: threadingHeaders["References"] || null,
      } satisfies InsertEmail)
      .returning({ id: EmailTable.id });

    if (!email) {
      throw new Error("Failed to create email");
    }

    const recipientRows: InsertEmailRecipient[] = [
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

export async function updateEmailAfterSend(
  database: DatabaseType,
  emailId: string,
  result: MailSendResult
): Promise<void> {
  const updates: UpdateEmail = {
    status: result.success ? "sent" : "failed",
    updatedAt: new Date(),
  };

  if (result.success && result.messageId) {
    updates.resendId = result.messageId;
  }

  if (!result.success) {
    updates.metadata = {
      sendError: result.error,
      sendFailedAt: new Date().toISOString(),
    };
  }

  await database
    .update(EmailTable)
    .set(updates)
    .where(eq(EmailTable.id, emailId));
}

export async function createInboundEmailRecord(
  database: DatabaseType,
  params: {
    threadId: string;
    subject: string;
    text?: string;
    html?: string;
    rawEmail: string;
    headers?: Record<string, string>;
    messageId: string;
    inReplyTo?: string;
    references?: string;
    from: RecipientInfo;
    to: RecipientInfo[];
    attachments?: Array<{
      filename: string;
      contentType: string;
    }>;
  }
): Promise<string> {
  const [email] = await database
    .insert(EmailTable)
    .values({
      threadId: params.threadId,
      direction: "inbound",
      status: "delivered",
      resendId: null,
      subject: params.subject,
      textBody: params.text,
      htmlBody: params.html,
      rawEmail: params.rawEmail,
      headers: params.headers || {},
      messageId: params.messageId,
      inReplyTo: params.inReplyTo || null,
      references: params.references || null,
    } satisfies InsertEmail)
    .returning({ id: EmailTable.id });

  if (!email) {
    throw new Error("Failed to create email");
  }

  const recipientRows: InsertEmailRecipient[] = [
    {
      emailId: email.id,
      type: "from" as const,
      email: params.from.email,
      name: params.from.name,
    },
    ...params.to.map((r) => ({
      emailId: email.id,
      type: "to" as const,
      email: r.email,
      name: r.name,
    })),
  ];

  await database.insert(EmailRecipientTable).values(recipientRows);

  if (params.attachments?.length) {
    await database.insert(EmailAttachmentTable).values(
      params.attachments.map(
        (a) =>
          ({
            emailId: email.id,
            filename: a.filename,
            contentType: a.contentType,
            contentId: null,
          }) satisfies InsertEmailAttachment
      )
    );
  }

  return email.id;
}

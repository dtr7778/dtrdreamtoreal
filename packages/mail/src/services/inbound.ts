import { randomUUID } from "node:crypto";

import { DatabaseType } from "@workspace/drizzle/client";

import type { InboundEmailPayload, InboundEmailResult } from "../types";
import {
  createInboundEmailRecord,
  normalizeRecipient,
  normalizeRecipients,
} from "./email-records";
import { findOrCreateThread } from "./threading";

export async function processInboundEmail(
  database: DatabaseType,
  payload: InboundEmailPayload
): Promise<InboundEmailResult> {
  try {
    const cleanMessageId = payload.messageId
      ? payload.messageId.replace(/^<|>$/g, "")
      : randomUUID();

    const fromEmail = normalizeRecipient(payload.from);
    const toRecipients = normalizeRecipients(payload.to);

    const { threadId } = await findOrCreateThread(database, {
      inReplyTo: payload.inReplyTo,
      subject: payload.subject,
      contactEmail: fromEmail.email,
    });

    const emailId = await createInboundEmailRecord(database, {
      threadId,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
      rawEmail: JSON.stringify(payload),
      headers: payload.headers,
      messageId: cleanMessageId,
      inReplyTo: payload.inReplyTo,
      references: payload.references,
      from: fromEmail,
      to: toRecipients,
      attachments: payload.attachments?.map((a) => ({
        filename: a.filename,
        contentType: a.contentType,
      })),
    });

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

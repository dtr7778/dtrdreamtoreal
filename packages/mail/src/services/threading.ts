import { eq, sql } from "drizzle-orm";

import { DatabaseType } from "@workspace/drizzle/client";
import {
  EmailTable,
  EmailThreadTable,
  InsertEmailThread,
} from "@workspace/drizzle/schemas";

export interface ThreadResult {
  threadId: string;
  isNew: boolean;
}

export async function findOrCreateThread(
  database: DatabaseType,
  params: {
    inReplyTo?: string;
    subject: string;
    contactEmail: string;
  }
): Promise<ThreadResult> {
  if (params.inReplyTo) {
    const cleanInReplyTo = params.inReplyTo.replace(/^<|>$/g, "");
    const [existingEmail] = await database
      .select({
        id: EmailTable.id,
        threadId: EmailTable.threadId,
      })
      .from(EmailTable)
      .where(eq(EmailTable.messageId, cleanInReplyTo))
      .limit(1);

    if (existingEmail?.threadId) {
      await database
        .update(EmailThreadTable)
        .set({
          lastEmailAt: new Date(),
          lastEmailDirection: "inbound",
          emailCount: sql`(SELECT COUNT(*) FROM ${EmailTable} WHERE ${EmailTable.threadId} = ${EmailThreadTable.id})`,
        })
        .where(eq(EmailThreadTable.id, existingEmail.threadId));

      return { threadId: existingEmail.threadId, isNew: false };
    }
  }

  const [thread] = await database
    .insert(EmailThreadTable)
    .values({
      subject: params.subject,
      contactEmail: params.contactEmail,
      lastEmailAt: new Date(),
      lastEmailDirection: "inbound",
      emailCount: 1,
    } satisfies InsertEmailThread)
    .returning({ id: EmailThreadTable.id });

  if (!thread) {
    throw new Error("Failed to create thread");
  }

  return { threadId: thread.id, isNew: true };
}

export async function updateThreadForOutbound(
  database: DatabaseType,
  params: {
    threadId?: string;
    subject: string;
    contactEmail: string;
  }
): Promise<ThreadResult> {
  if (params.threadId) {
    const [existThread] = await database
      .select({ id: EmailThreadTable.id })
      .from(EmailThreadTable)
      .where(eq(EmailThreadTable.id, params.threadId))
      .limit(1);

    if (!existThread) {
      throw new Error("Thread not found");
    }

    return { threadId: existThread.id, isNew: false };
  }

  const [thread] = await database
    .insert(EmailThreadTable)
    .values({
      subject: `Re: ${params.subject}`,
      contactEmail: params.contactEmail,
      lastEmailAt: new Date(),
      lastEmailDirection: "outbound",
      emailCount: 1,
    } satisfies InsertEmailThread)
    .returning({ id: EmailThreadTable.id });

  if (!thread) {
    throw new Error("Failed to create thread");
  }

  return { threadId: thread.id, isNew: true };
}

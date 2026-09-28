import { eq } from "drizzle-orm";

import {
  EmailThreadTable,
  InsertEmailThread,
} from "@workspace/drizzle/schemas";
import { DatabaseType } from "@workspace/drizzle/types";

export interface IEmailThreadService {
  findOrCreateThread(
    params: {
      threadId?: string | undefined;
      subject: string;
      contactEmail: string;
      contactName?: string | undefined;
    },
    database?: DatabaseType | undefined
  ): Promise<string>;
}

export class EmailThreadService implements IEmailThreadService {
  constructor(private readonly database: DatabaseType) {}

  private resolveDB(database?: DatabaseType): DatabaseType {
    return database ?? this.database;
  }

  public async findOrCreateThread(
    params: {
      threadId?: string;
      subject: string;
      contactEmail: string;
      contactName?: string;
    },
    database?: DatabaseType
  ): Promise<string> {
    const db = this.resolveDB(database);

    if (params.threadId) {
      const [existThread] = await db
        .select({ id: EmailThreadTable.id })
        .from(EmailThreadTable)
        .where(eq(EmailThreadTable.id, params.threadId))
        .limit(1);

      if (!existThread) {
        throw new Error("Thread is not found");
      }

      return existThread.id;
    }

    const [thread] = await db
      .insert(EmailThreadTable)
      .values({
        subject: params.subject,
        contactEmail: params.contactEmail,
        contactName: params?.contactName,
      } satisfies InsertEmailThread)
      .returning({ id: EmailThreadTable.id });

    if (!thread) {
      throw new Error("Failed to create thread");
    }

    return thread.id;
  }
}

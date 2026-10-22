import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../../utils/db-utils";
import { EmailDirectionEnum, EmailStatusEnum } from "../../enums/db-enums";
import { ContactSubmissionReplyTable } from "../contact";
import { EmailAttachmentTable } from "./emailAttachment.table";
import { EmailRecipientTable } from "./emailRecipient.table";
import { EmailThreadTable } from "./emailThread.table";

export const EmailTable = sqliteTable(
  "emails",
  {
    id: db_id,

    threadId: text("thread_id"),

    direction: EmailDirectionEnum("direction").notNull(),
    status: EmailStatusEnum("status").notNull().default("draft"),

    resendId: text("resend_id"),
    resendMessageId: text("resend_message_id"),
    qMessageId: text("q_message_id"),

    // Content
    subject: text("subject"),
    textBody: text("text_body"),
    htmlBody: text("html_body"),

    headers: text("headers", { mode: "json" }).$type<Record<string, string>>(),

    metadata: text("metadata", { mode: "json" }).$type<
      Record<string, unknown>
    >(),

    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "email_emailThread_fkey",
      columns: [table.threadId],
      foreignColumns: [EmailThreadTable.id],
    }).onDelete("set null"),
    index("email_emailThreadId_idx").on(table.threadId),
    uniqueIndex("email_resendId_idx").on(table.resendId),
    uniqueIndex("email_qMessageId_idx").on(table.qMessageId),
    index("email_messageId_idx").on(table.resendMessageId),
    index("email_direction_idx").on(table.direction),
    index("email_status_idx").on(table.status),
    index("email_createdAt_idx").on(table.createdAt),
  ]
);

export const EmailRelations = relations(EmailTable, ({ one, many }) => ({
  thread: one(EmailThreadTable, {
    fields: [EmailTable.threadId],
    references: [EmailThreadTable.id],
    relationName: "EmailToEmailThread",
  }),
  recipients: many(EmailRecipientTable, {
    relationName: "EmailRecipientToEmail",
  }),
  attachments: many(EmailAttachmentTable, {
    relationName: "EmailAttachmentToEmail",
  }),
  contactReply: one(ContactSubmissionReplyTable, {
    fields: [EmailTable.id],
    references: [ContactSubmissionReplyTable.emailId],
    relationName: "ContactSubmissionReplyToEmail",
  }),
}));

export const insertEmailSchema = createInsertSchema(EmailTable, {
  threadId: z.uuid().nullish(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectEmailSchema = createSelectSchema(EmailTable, {
  id: z.uuid(),
  threadId: z.uuid().nullish(),
});
export const updateEmailSchema = createUpdateSchema(EmailTable, {
  threadId: z.uuid().nullish(),
}).omit({
  id: true,
  createdAt: true,
});

export type EmailDataModel = typeof EmailTable.$inferSelect;
export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type SelectEmail = z.infer<typeof selectEmailSchema>;
export type UpdateEmail = z.infer<typeof updateEmailSchema>;

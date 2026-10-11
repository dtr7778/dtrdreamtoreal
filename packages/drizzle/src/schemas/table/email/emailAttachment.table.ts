import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type z from "zod";

import { db_created_at, db_id } from "../../db-utils";
import { EmailTable } from "./email.table";

export const EmailAttachmentTable = sqliteTable(
  "email_attachments",
  {
    id: db_id,
    emailId: text("email_id").notNull(),
    filename: text("filename").notNull(),
    contentType: text("content_type").notNull(),
    contentId: text("content_id"),
    contentDisposition: text("content_disposition"),
    size: integer("size"),
    storageKey: text("storage_key"), // S3/R2 path
    url: text("url"),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "emailAttachment_emailId_fkey",
      columns: [table.emailId],
      foreignColumns: [EmailTable.id],
    }).onDelete("cascade"),
    index("emailAttachment_emailId_idx").on(table.emailId),
    index("emailAttachment_contentId_idx").on(table.contentId),
  ]
);

export const EmailAttachmentRelations = relations(
  EmailAttachmentTable,
  ({ one }) => ({
    email: one(EmailTable, {
      fields: [EmailAttachmentTable.emailId],
      references: [EmailTable.id],
      relationName: "EmailAttachmentToEmail",
    }),
  })
);

export const insertEmailAttachmentSchema = createInsertSchema(
  EmailAttachmentTable
).omit({ id: true, createdAt: true });
export const selectEmailAttachmentSchema =
  createSelectSchema(EmailAttachmentTable);
export const updateEmailAttachmentSchema = createUpdateSchema(
  EmailAttachmentTable
).omit({ id: true, createdAt: true });

export type EmailAttachmentDataModel = typeof EmailAttachmentTable.$inferSelect;
export type InsertEmailAttachment = z.infer<typeof insertEmailAttachmentSchema>;
export type SelectEmailAttachment = z.infer<typeof selectEmailAttachmentSchema>;
export type UpdateEmailAttachment = z.infer<typeof updateEmailAttachmentSchema>;

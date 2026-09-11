import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import { ContactSubmissionTable } from "./contactSubmission.table";

export const ContactSubmissionReplyTable = pgTable(
  "contact_submission_replies",
  {
    id: db_id,
    submissionId: uuid("submission_id").notNull(),
    repliedBy: uuid("replied_by").notNull(),
    reply: text("reply").notNull(),
    messageId: varchar("message_id"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "contactSubmissionReply_submission_fkey",
      columns: [table.submissionId],
      foreignColumns: [ContactSubmissionTable.id],
    }).onDelete("cascade"),
    index("contactSubmissionReply_submissionId_idx").on(table.submissionId),
    index("contactSubmissionReply_messageId_idx").on(table.messageId),
    index("contactSubmissionReply_createdAt_idx").on(table.createdAt),
  ]
);

export const ContactSubmissionReplyRelations = relations(
  ContactSubmissionReplyTable,
  ({ one }) => ({
    submission: one(ContactSubmissionTable, {
      fields: [ContactSubmissionReplyTable.submissionId],
      references: [ContactSubmissionTable.id],
      relationName: "ContactSubmissionReplyToSubmission",
    }),
  })
);

export const insertContactSubmissionReplySchema = createInsertSchema(
  ContactSubmissionReplyTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectContactSubmissionReplySchema = createSelectSchema(
  ContactSubmissionReplyTable
);
export const updateContactSubmissionReplySchema = createUpdateSchema(
  ContactSubmissionReplyTable
).omit({ id: true, createdAt: true });

export type ContactSubmissionReplyDataModel =
  typeof ContactSubmissionReplyTable.$inferSelect;
export type InsertContactSubmissionReply = z.infer<
  typeof insertContactSubmissionReplySchema
>;
export type SelectContactSubmissionReply = z.infer<
  typeof selectContactSubmissionReplySchema
>;
export type UpdateContactSubmissionReply = z.infer<
  typeof updateContactSubmissionReplySchema
>;

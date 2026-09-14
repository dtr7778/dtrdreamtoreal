import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  pgTable,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import { EmailTable } from "../email";
import { UserTable } from "../user";
import { ContactSubmissionTable } from "./contactSubmission.table";

export const ContactSubmissionReplyTable = pgTable(
  "contact_submission_replies",
  {
    id: db_id,
    submissionId: uuid("submission_id").notNull(),
    repliedBy: uuid("replied_by").notNull(),
    emailId: uuid("email_id").notNull(),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "contactSubmissionReply_submission_fkey",
      columns: [table.submissionId],
      foreignColumns: [ContactSubmissionTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "contactSubmissionReply_repliedBy_fkey",
      columns: [table.repliedBy],
      foreignColumns: [UserTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "contactSubmissionReply_emailId_fkey",
      columns: [table.emailId],
      foreignColumns: [EmailTable.id],
    }).onDelete("cascade"),
    index("contactSubmissionReply_submissionId_idx").on(table.submissionId),
    index("contactSubmissionReply_repliedBy_idx").on(table.repliedBy),
    uniqueIndex("contactSubmissionReply_emailId_idx").on(table.emailId),
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
    user: one(UserTable, {
      fields: [ContactSubmissionReplyTable.repliedBy],
      references: [UserTable.id],
      relationName: "ContactSubmissionReplyToUser",
    }),
    email: one(EmailTable, {
      fields: [ContactSubmissionReplyTable.emailId],
      references: [EmailTable.id],
      relationName: "ContactSubmissionReplyToEmail",
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

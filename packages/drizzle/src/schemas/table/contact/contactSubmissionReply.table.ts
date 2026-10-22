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
import { EmailTable } from "../email";
import { UserTable } from "../user";
import { ContactSubmissionTable } from "./contactSubmission.table";

export const ContactSubmissionReplyTable = sqliteTable(
  "contact_submission_replies",
  {
    id: db_id,
    submissionId: text("submission_id").notNull(),
    repliedBy: text("replied_by").notNull(),
    emailId: text("email_id").notNull(),
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
  ContactSubmissionReplyTable,
  {
    submissionId: z.uuid(),
    repliedBy: z.uuid(),
    emailId: z.uuid(),
  }
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectContactSubmissionReplySchema = createSelectSchema(
  ContactSubmissionReplyTable,
  {
    id: z.uuid(),
    submissionId: z.uuid(),
    repliedBy: z.uuid(),
    emailId: z.uuid(),
  }
);
export const updateContactSubmissionReplySchema = createUpdateSchema(
  ContactSubmissionReplyTable,
  {
    submissionId: z.uuid().optional(),
    repliedBy: z.uuid().optional(),
    emailId: z.uuid().optional(),
  }
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

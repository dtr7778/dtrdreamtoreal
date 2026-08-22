import { relations } from "drizzle-orm";
import { foreignKey, index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import { UserTable } from "../user";
import { ContactSubmissionTable } from "./contactSubmission.table";

export const ContactSubmissionReplyTable = pgTable(
  "contact_submission_replies",
  {
    id: db_id,
    submissionId: uuid("submission_id").notNull(),
    repliedBy: uuid("replied_by").notNull(),
    reply: text("reply").notNull(),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "contact_submission_reply_submission_fkey",
      columns: [table.submissionId],
      foreignColumns: [ContactSubmissionTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "contact_submission_reply_replied_by_fkey",
      columns: [table.repliedBy],
      foreignColumns: [UserTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("contact_submission_reply_submission_id_idx").on(table.submissionId),
    index("contact_submission_reply_replied_by_idx").on(table.repliedBy),
  ]
);

export const ContactSubmissionReplyRelations = relations(
  ContactSubmissionReplyTable,
  ({ one }) => ({
    submission: one(ContactSubmissionTable, {
      fields: [ContactSubmissionReplyTable.submissionId],
      references: [ContactSubmissionTable.id],
      relationName: "ContactSubmissionReplyToContactSubmission",
    }),
    repliedBy: one(UserTable, {
      fields: [ContactSubmissionReplyTable.repliedBy],
      references: [UserTable.id],
      relationName: "ContactSubmissionReplyToUser",
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
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

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

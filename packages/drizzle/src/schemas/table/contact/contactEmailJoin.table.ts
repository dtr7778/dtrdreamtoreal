import { relations } from "drizzle-orm";
import { foreignKey, index, pgTable, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id } from "../../../db-utils";
import { EmailTable } from "../email";
import { ContactSubmissionTable } from "./contactSubmission.table";

export const ContactEmailJoinTable = pgTable(
  "contact_email_joins",
  {
    id: db_id,
    submissionId: uuid("submission_id").notNull(),
    emailId: uuid("email_id").notNull(),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "contactEmailJoin_submission_fkey",
      columns: [table.submissionId],
      foreignColumns: [ContactSubmissionTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "contactEmailJoin_email_fkey",
      columns: [table.submissionId],
      foreignColumns: [EmailTable.id],
    }).onDelete("cascade"),
    index("contactEmailJoin_sumissionId_idx").on(table.submissionId),
    index("contactEmailJoin_emailId_idx").on(table.emailId),
  ]
);

export const ContactEmailJoinRelation = relations(
  ContactEmailJoinTable,
  ({ one }) => ({
    submission: one(ContactSubmissionTable, {
      fields: [ContactEmailJoinTable.submissionId],
      references: [ContactSubmissionTable.id],
      relationName: "ContactEmailJoinToSubmission",
    }),
    email: one(EmailTable, {
      fields: [ContactEmailJoinTable.submissionId],
      references: [EmailTable.id],
      relationName: "ContactEmailJoinToEmail",
    }),
  })
);

export const insertContactEmailJoinSchema = createInsertSchema(
  ContactEmailJoinTable
).omit({
  id: true,
  createdAt: true,
});
export const selectContactEmailJoinSchema = createSelectSchema(
  ContactEmailJoinTable
);

export type ContactEmailJoinDataModel =
  typeof ContactEmailJoinTable.$inferSelect;
export type InsertContactEmailJoin = z.infer<
  typeof insertContactEmailJoinSchema
>;
export type SelectContactEmailJoin = z.infer<
  typeof selectContactEmailJoinSchema
>;

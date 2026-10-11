import { relations } from "drizzle-orm";
import {
  index,
  integer,
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

import { db_created_at, db_id, db_updated_at } from "../../db-utils";
import { ContactSubmissionTable } from "./contactSubmission.table";

export const ContactUserTable = sqliteTable(
  "contact_users",
  {
    id: db_id,
    email: text("email").notNull(),
    firstName: text("first_name").notNull(),
    middleName: text("middle_name"),
    lastName: text("last_name"),
    phone: text("phone"),
    company: text("company"),

    isBlocked: integer("is_blocked", { mode: "boolean" })
      .notNull()
      .default(false),
    blockedReason: text("blocked_reason"),
    spamCount: integer("spam_count").notNull().default(0),
    submissionCount: integer("submission_count").notNull().default(0),
    lastSubmittedAt: integer("last_submitted_at", { mode: "timestamp_ms" }),

    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    uniqueIndex("contactUser_email_idx").on(table.email),
    index("contactUser_firstName_idx").on(table.firstName),
    index("contactUser_createdAt_idx").on(table.createdAt),
    index("contactUser_isBlocked_idx").on(table.isBlocked),
  ]
);

export const ContactUserRelations = relations(ContactUserTable, ({ many }) => ({
  contactSubmission: many(ContactSubmissionTable, {
    relationName: "ContactSubmissionToContactUser",
  }),
}));

export const insertContactUserSchema = createInsertSchema(ContactUserTable, {
  email: z.email(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectContactUserSchema = createSelectSchema(ContactUserTable, {
  email: z.email(),
});
export const updateContactUserSchema = createUpdateSchema(ContactUserTable, {
  email: z.email().nullish(),
}).omit({ id: true, createdAt: true });

export type ContactUserDataModel = typeof ContactUserTable.$inferSelect;
export type InsertContactUser = z.infer<typeof insertContactUserSchema>;
export type SelectContactUser = z.infer<typeof selectContactUserSchema>;
export type UpdateContactUser = z.infer<typeof updateContactUserSchema>;

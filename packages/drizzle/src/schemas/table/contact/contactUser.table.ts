import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  uniqueIndex,
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

export const ContactUserTable = pgTable(
  "contact_users",
  {
    id: db_id,
    email: varchar("email", { length: 320 }).notNull(),
    name: varchar("name", { length: 255 }),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    phone: varchar("phone", { length: 50 }),
    company: varchar("company", { length: 255 }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    uniqueIndex("contactUser_email_idx").on(table.email),
    index("contactUser_name_idx").on(table.name),
    index("contactUser_createdAt_idx").on(table.createdAt),
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

import { relations } from "drizzle-orm";
import { index, pgTable, text, varchar } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import { ContactSubmissionStatusEnum } from "../../enums/db-enums";
import { ContactSubmissionReplyTable } from "./contactSubmissionReply.table";

export const ContactSubmissionTable = pgTable(
  "contact_submissions",
  {
    id: db_id,
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    subject: varchar("subject", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    company: varchar("company", { length: 255 }),
    message: text("message").notNull(),
    status: ContactSubmissionStatusEnum("status").notNull().default("PENDING"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    index("contact_submission_email_idx").on(table.email),
    index("contact_submission_status_idx").on(table.status),
    index("contact_submission_created_at_idx").on(table.createdAt),
  ]
);

export const ContactSubmissionRelations = relations(
  ContactSubmissionTable,
  ({ many }) => ({
    replies: many(ContactSubmissionReplyTable, {
      relationName: "ContactSubmissionReplyToContactSubmission",
    }),
  })
);

export const insertContactSubmissionSchema = createInsertSchema(
  ContactSubmissionTable,
  {
    email: z.email(),
  }
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectContactSubmissionSchema = createSelectSchema(
  ContactSubmissionTable
);
export const updateContactSubmissionSchema = createUpdateSchema(
  ContactSubmissionTable,
  {
    email: z.email().optional(),
  }
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ContactSubmissionDataModel =
  typeof ContactSubmissionTable.$inferSelect;
export type InsertContactSubmission = z.infer<
  typeof insertContactSubmissionSchema
>;
export type SelectContactSubmission = z.infer<
  typeof selectContactSubmissionSchema
>;
export type UpdateContactSubmission = z.infer<
  typeof updateContactSubmissionSchema
>;

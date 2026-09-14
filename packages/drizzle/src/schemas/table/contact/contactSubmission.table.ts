import { relations } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
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
import { ContactStatusEnum } from "../../enums/db-enums";
import { EmailThreadTable } from "../email";
import { ContactUserTable } from "./contactUser.table";

export const ContactSubmissionTable = pgTable(
  "contact_submissions",
  {
    id: db_id,
    emailThreadId: uuid("email_thread_id").notNull(),
    contactUserId: uuid("contact_user_id").notNull(),
    subject: varchar("subject"),
    message: varchar("message").notNull(),
    status: ContactStatusEnum("status").notNull().default("pending"),

    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    notes: text("notes"),

    isSpam: boolean("is_spam").notNull().default(false),
    spamReason: text("spam_reason"),

    readAt: timestamp("read_at", { withTimezone: true, precision: 3 }),
    closedAt: timestamp("closed_at", { withTimezone: true, precision: 3 }),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "contactSubmission_contactUser_fkey",
      columns: [table.contactUserId],
      foreignColumns: [ContactUserTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "contactSubmission_emailThread_fkey",
      columns: [table.emailThreadId],
      foreignColumns: [EmailThreadTable.id],
    }).onDelete("cascade"),
    index("contactSubmission_contactUserId_idx").on(table.contactUserId),
    uniqueIndex("contactSubmission_emailThreadId_idx").on(table.emailThreadId),
    index("contactSubmission_status_idx").on(table.status),
    index("contactSubmission_createdAt_idx").on(table.createdAt),
  ]
);

export const ContactSubmissionRelations = relations(
  ContactSubmissionTable,
  ({ one }) => ({
    emailThread: one(EmailThreadTable, {
      relationName: "ContactSubmissionToEmailThread",
      fields: [ContactSubmissionTable.emailThreadId],
      references: [EmailThreadTable.id],
    }),
    contactUser: one(ContactUserTable, {
      relationName: "ContactSubmissionToContactUser",
      fields: [ContactSubmissionTable.contactUserId],
      references: [ContactUserTable.id],
    }),
  })
);

export const insertContactSubmissionSchema = createInsertSchema(
  ContactSubmissionTable
).omit({
  id: true,
  readAt: true,
  closedAt: true,
  createdAt: true,
  updatedAt: true,
});
export const selectContactSubmissionSchema = createSelectSchema(
  ContactSubmissionTable
);
export const updateContactSubmissionSchema = createUpdateSchema(
  ContactSubmissionTable
).omit({ id: true, createdAt: true });

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

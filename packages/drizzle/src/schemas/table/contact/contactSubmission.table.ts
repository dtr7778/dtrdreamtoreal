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

import {
  db_bool,
  db_created_at,
  db_date,
  db_id,
  db_updated_at,
} from "../../../utils/db-utils";
import { ContactStatusEnum } from "../../enums/db-enums";
import { EmailThreadTable } from "../email";
import { ContactUserTable } from "./contactUser.table";

export const ContactSubmissionTable = sqliteTable(
  "contact_submissions",
  {
    id: db_id,
    emailThreadId: text("email_thread_id").notNull(),
    contactUserId: text("contact_user_id").notNull(),
    subject: text("subject"),
    message: text("message").notNull(),
    status: ContactStatusEnum("status").notNull().default("pending"),

    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    notes: text("notes"),

    isSpam: db_bool("is_spam").notNull().default(false),
    spamReason: text("spam_reason"),

    readAt: db_date("read_at"),
    closedAt: db_date("closed_at"),
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
  ContactSubmissionTable,
  {
    emailThreadId: z.uuid(),
    contactUserId: z.uuid(),
  }
).omit({
  id: true,
  readAt: true,
  closedAt: true,
  createdAt: true,
  updatedAt: true,
});
export const selectContactSubmissionSchema = createSelectSchema(
  ContactSubmissionTable,
  {
    id: z.uuid(),
    emailThreadId: z.uuid(),
    contactUserId: z.uuid(),
  }
);
export const updateContactSubmissionSchema = createUpdateSchema(
  ContactSubmissionTable,
  {
    emailThreadId: z.uuid().optional(),
    contactUserId: z.uuid().optional(),
  }
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

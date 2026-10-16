import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../db-utils";
import { ContactSubmissionTable } from "../contact";
import { LeadCompanyEmailThreadTable, LeadUserEmailThreadTable } from "../lead";
import { UserTable } from "../user";
import { EmailTable } from "./email.table";

export const EmailThreadTable = sqliteTable(
  "email_threads",
  {
    id: db_id,

    subject: text("subject").notNull(),

    // Participants
    contactEmail: text("contact_email").notNull(), // The original contact form email
    contactName: text("contact_name"),

    isClosed: integer("is_closed", { mode: "boolean" })
      .notNull()
      .default(false),
    closedAt: integer("closed_at", { mode: "timestamp_ms" }),
    closedBy: text("closed_by"),

    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "emailThread_closedBy_fkey",
      columns: [table.closedBy],
      foreignColumns: [UserTable.id],
    }).onDelete("set null"),
    index("emailThread_closedBy_idx").on(table.closedBy),
    index("emailThread_contactEmail_idx").on(table.contactEmail),
    index("emailThread_isClosed_idx").on(table.isClosed),
  ]
);

export const EmailThreadRelations = relations(
  EmailThreadTable,
  ({ one, many }) => ({
    closedBy: one(UserTable, {
      fields: [EmailThreadTable.closedBy],
      references: [UserTable.id],
      relationName: "EmailThreadToClosedBy",
    }),
    emails: many(EmailTable, { relationName: "EmailToEmailThread" }),
    leadCompanies: many(LeadCompanyEmailThreadTable, {
      relationName: "LeadCompanyEmailThreadToEmailThread",
    }),
    leadUsers: many(LeadUserEmailThreadTable, {
      relationName: "LeadUserEmailThreadToEmailThread",
    }),
    contactSubmission: one(ContactSubmissionTable, {
      relationName: "ContactSubmissionToEmailThread",
      references: [ContactSubmissionTable.emailThreadId],
      fields: [EmailThreadTable.id],
    }),
  })
);

export const insertEmailThreadSchema = createInsertSchema(EmailThreadTable, {
  contactEmail: z.email(),
  closedBy: z.uuid().nullish(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectEmailThreadSchema = createSelectSchema(EmailThreadTable, {
  contactEmail: z.email(),
  id: z.uuid(),
  closedBy: z.uuid().nullish(),
});
export const updateEmailThreadSchema = createUpdateSchema(EmailThreadTable, {
  contactEmail: z.email().nullish(),
  closedBy: z.uuid().nullish(),
}).omit({ id: true, createdAt: true });

export type EmailThreadDataModel = typeof EmailThreadTable.$inferSelect;
export type InsertEmailThread = z.infer<typeof insertEmailThreadSchema>;
export type SelectEmailThread = z.infer<typeof selectEmailThreadSchema>;
export type UpdateEmailThread = z.infer<typeof updateEmailThreadSchema>;

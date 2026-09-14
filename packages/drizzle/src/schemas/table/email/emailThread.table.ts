import { relations } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  pgTable,
  timestamp,
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
import { ContactSubmissionTable } from "../contact";
import { CompanyEmailThreadTable } from "../employee/companyEmailThread.table";
import { EmployeeEmailThreadTable } from "../employee/employeeEmailThread.table";
import { UserTable } from "../user";
import { EmailTable } from "./email.table";

export const EmailThreadTable = pgTable(
  "email_threads",
  {
    id: db_id,

    subject: varchar("subject").notNull(),

    // Participants
    contactEmail: varchar("contact_email").notNull(), // The original contact form email
    contactName: varchar("contact_name"),

    isClosed: boolean("is_closed").notNull().default(false),
    closedAt: timestamp("closed_at", { withTimezone: true, precision: 3 }),
    closedBy: uuid("closed_by"),

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
    companies: many(CompanyEmailThreadTable, {
      relationName: "CompanyEmailThreadToEmailThread",
    }),
    employees: many(EmployeeEmailThreadTable, {
      relationName: "EmployeeEmailThreadToEmailThread",
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
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectEmailThreadSchema = createSelectSchema(EmailThreadTable, {
  contactEmail: z.email(),
});
export const updateEmailThreadSchema = createUpdateSchema(EmailThreadTable, {
  contactEmail: z.email().nullish(),
}).omit({ id: true, createdAt: true });

export type EmailThreadDataModel = typeof EmailThreadTable.$inferSelect;
export type InsertEmailThread = z.infer<typeof insertEmailThreadSchema>;
export type SelectEmailThread = z.infer<typeof selectEmailThreadSchema>;
export type UpdateEmailThread = z.infer<typeof updateEmailThreadSchema>;

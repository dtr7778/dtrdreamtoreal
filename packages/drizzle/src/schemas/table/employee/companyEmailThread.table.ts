import { relations } from "drizzle-orm";
import { foreignKey, index, pgTable, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id } from "../../../db-utils";
import { EmailThreadTable } from "../email/emailThread.table";
import { CompanyTable } from "./company.table";

export const CompanyEmailThreadTable = pgTable(
  "company_email_threads",
  {
    id: db_id,
    companyId: uuid("company_id").notNull(),
    emailThreadId: uuid("email_thread_id").notNull(),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "companyEmailThread_companyId_fkey",
      columns: [table.companyId],
      foreignColumns: [CompanyTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "companyEmailThread_emailThreadId_fkey",
      columns: [table.emailThreadId],
      foreignColumns: [EmailThreadTable.id],
    }).onDelete("cascade"),
    index("companyEmailThread_companyId_idx").on(table.companyId),
    index("companyEmailThread_emailThreadId_idx").on(table.emailThreadId),
  ]
);

export const CompanyEmailThreadRelation = relations(
  CompanyEmailThreadTable,
  ({ one }) => ({
    company: one(CompanyTable, {
      fields: [CompanyEmailThreadTable.companyId],
      references: [CompanyTable.id],
      relationName: "CompanyEmailThreadToCompany",
    }),
    emailThread: one(EmailThreadTable, {
      fields: [CompanyEmailThreadTable.emailThreadId],
      references: [EmailThreadTable.id],
      relationName: "CompanyEmailThreadToEmailThread",
    }),
  })
);

export const insertCompanyEmailThreadSchema = createInsertSchema(
  CompanyEmailThreadTable
).omit({
  id: true,
  createdAt: true,
});
export const selectCompanyEmailThreadSchema = createSelectSchema(
  CompanyEmailThreadTable
);

export type CompanyEmailThreadDataModel =
  typeof CompanyEmailThreadTable.$inferSelect;
export type InsertCompanyEmailThread = z.infer<
  typeof insertCompanyEmailThreadSchema
>;
export type SelectCompanyEmailThread = z.infer<
  typeof selectCompanyEmailThreadSchema
>;

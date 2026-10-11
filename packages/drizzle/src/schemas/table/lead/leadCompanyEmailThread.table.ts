import { relations } from "drizzle-orm";
import { foreignKey, index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type z from "zod";

import { db_created_at, db_id } from "../../db-utils";
import { EmailThreadTable } from "../email/emailThread.table";
import { LeadCompanyTable } from "./leadCompany.table";

export const LeadCompanyEmailThreadTable = sqliteTable(
  "lead_company_email_threads",
  {
    id: db_id,
    leadCompanyId: text("lead_company_id").notNull(),
    emailThreadId: text("email_thread_id").notNull(),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "leadCompanyEmailThread_leadCompanyId_fkey",
      columns: [table.leadCompanyId],
      foreignColumns: [LeadCompanyTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "leadCompanyEmailThread_emailThreadId_fkey",
      columns: [table.emailThreadId],
      foreignColumns: [EmailThreadTable.id],
    }).onDelete("cascade"),
    index("leadCompanyEmailThread_leadCompanyId_idx").on(table.leadCompanyId),
    index("leadCompanyEmailThread_emailThreadId_idx").on(table.emailThreadId),
  ]
);

export const LeadCompanyEmailThreadRelation = relations(
  LeadCompanyEmailThreadTable,
  ({ one }) => ({
    leadCompany: one(LeadCompanyTable, {
      fields: [LeadCompanyEmailThreadTable.leadCompanyId],
      references: [LeadCompanyTable.id],
      relationName: "LeadCompanyEmailThreadToLeadCompany",
    }),
    emailThread: one(EmailThreadTable, {
      fields: [LeadCompanyEmailThreadTable.emailThreadId],
      references: [EmailThreadTable.id],
      relationName: "LeadCompanyEmailThreadToEmailThread",
    }),
  })
);

export const insertLeadCompanyEmailThreadSchema = createInsertSchema(
  LeadCompanyEmailThreadTable
).omit({
  id: true,
  createdAt: true,
});
export const selectLeadCompanyEmailThreadSchema = createSelectSchema(
  LeadCompanyEmailThreadTable
);

export type LeadCompanyEmailThreadDataModel =
  typeof LeadCompanyEmailThreadTable.$inferSelect;
export type InsertLeadCompanyEmailThread = z.infer<
  typeof insertLeadCompanyEmailThreadSchema
>;
export type SelectLeadCompanyEmailThread = z.infer<
  typeof selectLeadCompanyEmailThreadSchema
>;

import { relations } from "drizzle-orm";
import { foreignKey, index, pgTable, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id } from "../../../db-utils";
import { AiUsageTable } from "../aiUsage.table";
import { CompanyTable } from "./company.table";

export const CompanyAiUsageTable = pgTable(
  "company_ai_usages",
  {
    id: db_id,
    companyId: uuid("company_id").notNull(),
    aiUsageId: uuid("ai_usage_id").notNull(),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "companyAiUsage_companyId_fkey",
      columns: [table.companyId],
      foreignColumns: [CompanyTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "companyAiUsage_aiUsageId_fkey",
      columns: [table.aiUsageId],
      foreignColumns: [AiUsageTable.id],
    }).onDelete("cascade"),
    index("companyAiUsage_companyId_idx").on(table.companyId),
    index("companyAiUsage_aiUsageId_idx").on(table.aiUsageId),
  ]
);

export const CompanyAiUsageRelation = relations(
  CompanyAiUsageTable,
  ({ one }) => ({
    company: one(CompanyTable, {
      fields: [CompanyAiUsageTable.companyId],
      references: [CompanyTable.id],
      relationName: "CompanyAiUsageToCompany",
    }),
    aiUsage: one(AiUsageTable, {
      fields: [CompanyAiUsageTable.aiUsageId],
      references: [AiUsageTable.id],
      relationName: "CompanyAiUsageToAiUsage",
    }),
  })
);

export const insertCompanyAiUsageSchema = createInsertSchema(
  CompanyAiUsageTable
).omit({
  id: true,
  createdAt: true,
});
export const selectCompanyAiUsageSchema =
  createSelectSchema(CompanyAiUsageTable);

export type CompanyAiUsageDataModel = typeof CompanyAiUsageTable.$inferSelect;
export type InsertCompanyAiUsage = z.infer<typeof insertCompanyAiUsageSchema>;
export type SelectCompanyAiUsage = z.infer<typeof selectCompanyAiUsageSchema>;

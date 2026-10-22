import { relations } from "drizzle-orm";
import { foreignKey, index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id } from "../../../utils/db-utils";
import { AiUsageTable } from "../aiUsage.table";
import { LeadCompanyTable } from "./leadCompany.table";

export const LeadCompanyAiUsageTable = sqliteTable(
  "lead_company_ai_usages",
  {
    id: db_id,
    leadCompanyId: text("lead_company_id").notNull(),
    aiUsageId: text("ai_usage_id").notNull(),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "leadCompanyAiUsage_leadCompanyId_fkey",
      columns: [table.leadCompanyId],
      foreignColumns: [LeadCompanyTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "leadCompanyAiUsage_aiUsageId_fkey",
      columns: [table.aiUsageId],
      foreignColumns: [AiUsageTable.id],
    }).onDelete("cascade"),
    index("leadCompanyAiUsage_leadCompanyId_idx").on(table.leadCompanyId),
    index("leadCompanyAiUsage_aiUsageId_idx").on(table.aiUsageId),
  ]
);

export const LeadCompanyAiUsageRelation = relations(
  LeadCompanyAiUsageTable,
  ({ one }) => ({
    leadCompany: one(LeadCompanyTable, {
      fields: [LeadCompanyAiUsageTable.leadCompanyId],
      references: [LeadCompanyTable.id],
      relationName: "LeadCompanyAiUsageToLeadCompany",
    }),
    aiUsage: one(AiUsageTable, {
      fields: [LeadCompanyAiUsageTable.aiUsageId],
      references: [AiUsageTable.id],
      relationName: "LeadCompanyAiUsageToAiUsage",
    }),
  })
);

export const insertLeadCompanyAiUsageSchema = createInsertSchema(
  LeadCompanyAiUsageTable,
  {
    leadCompanyId: z.uuid(),
    aiUsageId: z.uuid(),
  }
).omit({
  id: true,
  createdAt: true,
});
export const selectLeadCompanyAiUsageSchema = createSelectSchema(
  LeadCompanyAiUsageTable,
  {
    id: z.uuid(),
    leadCompanyId: z.uuid(),
    aiUsageId: z.uuid(),
  }
);

export type LeadCompanyAiUsageDataModel =
  typeof LeadCompanyAiUsageTable.$inferSelect;
export type InsertLeadCompanyAiUsage = z.infer<
  typeof insertLeadCompanyAiUsageSchema
>;
export type SelectLeadCompanyAiUsage = z.infer<
  typeof selectLeadCompanyAiUsageSchema
>;

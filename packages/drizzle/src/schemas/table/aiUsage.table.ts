import { relations } from "drizzle-orm";
import {
  doublePrecision,
  foreignKey,
  index,
  integer,
  pgTable,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id } from "../../db-utils";
import { CompanyAiUsageTable } from "./employee/companyAiUsage.table";
import { UserTable } from "./user";

export const AiUsageTable = pgTable(
  "ai_usages",
  {
    id: db_id,
    provider: varchar("provider", { length: 50 })
      .notNull()
      .default("openrouter"),
    model: varchar("model", { length: 150 }).notNull(),
    activity: varchar("activity", { length: 100 }).notNull(),
    promptTokens: integer("prompt_tokens").notNull().default(0),
    completionTokens: integer("completion_tokens").notNull().default(0),
    totalTokens: integer("total_tokens").notNull().default(0),
    cost: doublePrecision("cost"),
    latencyMs: integer("latency_ms").notNull().default(0),
    createdBy: uuid("created_by").notNull(),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "ai_usage_createdBy_fkey",
      columns: [table.createdBy],
      foreignColumns: [UserTable.id],
    }).onDelete("cascade"),
    index("ai_usages_createdBy_idx").on(table.createdBy),
  ]
);

export const AiUsageRelation = relations(AiUsageTable, ({ one }) => ({
  createdBy: one(UserTable, {
    fields: [AiUsageTable.createdBy],
    references: [UserTable.id],
    relationName: "AiUsageToUser",
  }),
  company: one(CompanyAiUsageTable, {
    fields: [AiUsageTable.id],
    references: [CompanyAiUsageTable.aiUsageId],
    relationName: "CompanyAiUsageToAiUsage",
  }),
}));

export const insertAiUsageSchema = createInsertSchema(AiUsageTable).omit({
  id: true,
  createdAt: true,
});
export const selectAiUsageSchema = createSelectSchema(AiUsageTable);
export const updateAiUsageSchema = createUpdateSchema(AiUsageTable).omit({
  id: true,
  createdAt: true,
});

export type AiUsageDataModel = typeof AiUsageTable.$inferSelect;
export type InsertAiUsage = z.infer<typeof insertAiUsageSchema>;
export type SelectAiUsage = z.infer<typeof selectAiUsageSchema>;
export type UpdateAiUsage = z.infer<typeof updateAiUsageSchema>;

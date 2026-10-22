import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id } from "../../utils/db-utils";
import { LeadCompanyAiUsageTable } from "./lead";
import { UserTable } from "./user";

export const AiUsageTable = sqliteTable(
  "ai_usages",
  {
    id: db_id,
    provider: text("provider").notNull().default("openrouter"),
    model: text("model").notNull(),
    activity: text("activity").notNull(),
    promptTokens: integer("prompt_tokens").notNull().default(0),
    completionTokens: integer("completion_tokens").notNull().default(0),
    totalTokens: integer("total_tokens").notNull().default(0),
    cost: real("cost"),
    latencyMs: integer("latency_ms").notNull().default(0),
    createdBy: text("created_by").notNull(),
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
  leadCompany: one(LeadCompanyAiUsageTable, {
    fields: [AiUsageTable.id],
    references: [LeadCompanyAiUsageTable.aiUsageId],
    relationName: "LeadCompanyAiUsageToAiUsage",
  }),
}));

export const insertAiUsageSchema = createInsertSchema(AiUsageTable, {
  createdBy: z.uuid(),
}).omit({
  id: true,
  createdAt: true,
});
export const selectAiUsageSchema = createSelectSchema(AiUsageTable, {
  id: z.uuid(),
  createdBy: z.uuid(),
});
export const updateAiUsageSchema = createUpdateSchema(AiUsageTable, {
  createdBy: z.uuid().optional(),
}).omit({
  id: true,
  createdAt: true,
});

export type AiUsageDataModel = typeof AiUsageTable.$inferSelect;
export type InsertAiUsage = z.infer<typeof insertAiUsageSchema>;
export type SelectAiUsage = z.infer<typeof selectAiUsageSchema>;
export type UpdateAiUsage = z.infer<typeof updateAiUsageSchema>;

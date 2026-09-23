import { relations } from "drizzle-orm";
import {
  doublePrecision,
  foreignKey,
  index,
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

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import { CwvSourceEnum, CwvStrategyEnum } from "../../enums/db-enums";
import { SiteAuditTable } from "./siteAudit.table";

export const CwvSnapshotTable = pgTable(
  "cwv_snapshots",
  {
    id: db_id,
    siteAuditId: uuid("site_audit_id").notNull(),
    url: varchar("url", { length: 2048 }).notNull(),
    strategy: CwvStrategyEnum("strategy").notNull(),
    source: CwvSourceEnum("source").notNull(),
    lcp: doublePrecision("lcp"),
    inp: doublePrecision("inp"),
    cls: doublePrecision("cls"),
    ttfb: doublePrecision("ttfb"),
    fcp: doublePrecision("fcp"),
    performanceScore: doublePrecision("performance_score"),
    countryCode: varchar("country_code", { length: 8 }),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "cwvSnapshot_siteAudit_fkey",
      columns: [table.siteAuditId],
      foreignColumns: [SiteAuditTable.id],
    }).onDelete("cascade"),
    index("cwvSnapshot_siteAuditId_idx").on(table.siteAuditId),
    index("cwvSnapshot_url_idx").on(table.url),
    index("cwvSnapshot_strategy_idx").on(table.strategy),
    index("cwvSnapshot_source_idx").on(table.source),
    index("cwvSnapshot_countryCode_idx").on(table.countryCode),
  ]
);

export const CwvSnapshotRelation = relations(CwvSnapshotTable, ({ one }) => ({
  site: one(SiteAuditTable, {
    fields: [CwvSnapshotTable.siteAuditId],
    references: [SiteAuditTable.id],
    relationName: "CwvSnapshotToSiteAudit",
  }),
}));

export const insertCwvSnapshotSchema = createInsertSchema(
  CwvSnapshotTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectCwvSnapshotSchema = createSelectSchema(CwvSnapshotTable);
export const updateCwvSnapshotSchema = createUpdateSchema(
  CwvSnapshotTable
).omit({
  id: true,
  siteAuditId: true,
  createdAt: true,
  updatedAt: true,
});

export type CwvSnapshotDataModel = typeof CwvSnapshotTable.$inferSelect;
export type InsertCwvSnapshot = z.infer<typeof insertCwvSnapshotSchema>;
export type SelectCwvSnapshot = z.infer<typeof selectCwvSnapshotSchema>;
export type UpdateCwvSnapshot = z.infer<typeof updateCwvSnapshotSchema>;

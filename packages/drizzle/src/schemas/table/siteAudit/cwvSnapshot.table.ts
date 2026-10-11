import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../db-utils";
import { CwvSourceEnum, CwvStrategyEnum } from "../../enums/db-enums";
import { SiteAuditTable } from "./siteAudit.table";

export const CwvSnapshotTable = sqliteTable(
  "cwv_snapshots",
  {
    id: db_id,
    siteAuditId: text("site_audit_id").notNull(),
    url: text("url").notNull(),
    strategy: CwvStrategyEnum("strategy").notNull(),
    source: CwvSourceEnum("source").notNull(),
    lcp: real("lcp"),
    inp: real("inp"),
    cls: real("cls"),
    ttfb: real("ttfb"),
    fcp: real("fcp"),
    performanceScore: real("performance_score"),
    countryCode: text("country_code"),
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

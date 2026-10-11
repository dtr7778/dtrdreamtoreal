import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../db-utils";
import { AuditItemStatusEnum } from "../../enums/db-enums";
import { SiteAuditTable } from "./siteAudit.table";

export const AuditItemTable = sqliteTable(
  "audit_items",
  {
    id: db_id,
    siteAuditId: text("site_audit_id").notNull(),
    checklistKey: text("checklist_key").notNull(),
    section: text("section").notNull(),
    title: text("title").notNull(),
    url: text("url"),
    status: AuditItemStatusEnum("status").default("pending").notNull(),
    message: text("message"),
    evidence: text("evidence", { mode: "json" }).$type<
      Record<string, unknown>
    >(),
    durationMs: integer("duration_ms"),

    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "auditItem_siteAudit_fkey",
      columns: [table.siteAuditId],
      foreignColumns: [SiteAuditTable.id],
    }).onDelete("cascade"),
    index("auditItem_siteAuditId_idx").on(table.siteAuditId),
    index("auditItem_checklistKey_idx").on(table.checklistKey),
    index("auditItem_status_idx").on(table.status),
    index("auditItem_url_idx").on(table.url),
    uniqueIndex("auditItem_site_checklist_url_unq").on(
      table.siteAuditId,
      table.checklistKey,
      table.url
    ),
  ]
);

export const AuditItemRelation = relations(AuditItemTable, ({ one }) => ({
  auditRun: one(SiteAuditTable, {
    fields: [AuditItemTable.siteAuditId],
    references: [SiteAuditTable.id],
    relationName: "AuditItemToSiteAudit",
  }),
}));

export const insertAuditItemSchema = createInsertSchema(AuditItemTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectAuditItemSchema = createSelectSchema(AuditItemTable);
export const updateAuditItemSchema = createUpdateSchema(AuditItemTable).omit({
  id: true,
  siteAuditId: true,
  checklistKey: true,
  createdAt: true,
  updatedAt: true,
});

export type AuditItemDataModel = typeof AuditItemTable.$inferSelect;
export type InsertAuditItem = z.infer<typeof insertAuditItemSchema>;
export type SelectAuditItem = z.infer<typeof selectAuditItemSchema>;
export type UpdateAuditItem = z.infer<typeof updateAuditItemSchema>;

import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../db-utils";
import { AuditStatusEnum } from "../../enums/db-enums";
import { LeadCompanyTable } from "../lead";
import { UserTable } from "../user";
import { AuditItemTable } from "./auditItem.table";
import { AuditLogTable } from "./auditLog.table";
import { CwvSnapshotTable } from "./cwvSnapshot.table";

export const SiteAuditTable = sqliteTable(
  "site_audits",
  {
    id: db_id,
    companyId: text("company_id").notNull(),
    url: text("url").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: AuditStatusEnum("status").default("pending").notNull(),
    reportImageFileId: text("report_image_file_id"),
    error: text("error"),

    totalItems: integer("total_items").default(0).notNull(),
    completedItems: integer("completed_items").default(0).notNull(),
    passedItems: integer("passed_items").default(0).notNull(),
    failedItems: integer("failed_items").default(0).notNull(),

    startedAt: integer("started_at", { mode: "timestamp_ms" }),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),

    triggeredBy: text("triggered_by"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "siteAudit_company_fkey",
      columns: [table.companyId],
      foreignColumns: [LeadCompanyTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "siteAudit_triggerdBy_fkey",
      columns: [table.triggeredBy],
      foreignColumns: [UserTable.id],
    }).onDelete("set null"),
    index("siteAudit_companyId_idx").on(table.companyId),
    index("siteAudit_triggeredBy_idx").on(table.triggeredBy),
    index("siteAudit_createdAt_idx").on(table.createdAt),
  ]
);

export const SiteAuditRelations = relations(
  SiteAuditTable,
  ({ one, many }) => ({
    company: one(LeadCompanyTable, {
      fields: [SiteAuditTable.companyId],
      references: [LeadCompanyTable.id],
      relationName: "SiteAuditToLeadCompany",
    }),
    triggeredBy: one(UserTable, {
      fields: [SiteAuditTable.triggeredBy],
      references: [UserTable.id],
      relationName: "SiteAuditToTriggeredBy",
    }),
    auditItems: many(AuditItemTable, { relationName: "AuditItemToSiteAudit" }),
    auditLogs: many(AuditLogTable, { relationName: "AuditLogToSiteAudit" }),
    cwvSnapshots: many(CwvSnapshotTable, {
      relationName: "CwvSnapshotToSiteAudit",
    }),
  })
);

export const insertSiteAuditSchema = createInsertSchema(SiteAuditTable, {
  companyId: z.uuid(),
  triggeredBy: z.uuid().nullish(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectSiteAuditSchema = createSelectSchema(SiteAuditTable, {
  id: z.uuid(),
  companyId: z.uuid(),
  triggeredBy: z.uuid().nullish(),
});
export const updateSiteAuditSchema = createUpdateSchema(SiteAuditTable, {
  companyId: z.uuid().optional(),
  triggeredBy: z.uuid().nullish(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SiteAuditDataModel = typeof SiteAuditTable.$inferSelect;
export type InsertSiteAudit = z.infer<typeof insertSiteAuditSchema>;
export type SelectSiteAudit = z.infer<typeof selectSiteAuditSchema>;
export type UpdateSiteAudit = z.infer<typeof updateSiteAuditSchema>;

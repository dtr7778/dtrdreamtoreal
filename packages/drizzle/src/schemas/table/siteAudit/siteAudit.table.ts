import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
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
import { AuditStatusEnum } from "../../enums/db-enums";
import { CompanyTable } from "../employee";
import { UserTable } from "../user";
import { AuditItemTable } from "./auditItem.table";
import { AuditLogTable } from "./auditLog.table";
import { CwvSnapshotTable } from "./cwvSnapshot.table";

export const SiteAuditTable = pgTable(
  "site_audits",
  {
    id: db_id,
    companyId: uuid("company_id").notNull(),
    url: varchar("url").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    status: AuditStatusEnum("status").default("pending").notNull(),
    reportImageFileId: uuid("report_image_file_id"),
    error: text("error"),

    totalItems: integer("total_items").default(0).notNull(),
    completedItems: integer("completed_items").default(0).notNull(),
    passedItems: integer("passed_items").default(0).notNull(),
    failedItems: integer("failed_items").default(0).notNull(),

    startedAt: timestamp("started_at", { withTimezone: true, precision: 3 }),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      precision: 3,
    }),

    triggeredBy: uuid("triggered_by"),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "siteAudit_company_fkey",
      columns: [table.companyId],
      foreignColumns: [CompanyTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "siteAudit_triggerdBy_fkey",
      columns: [table.companyId],
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
    company: one(CompanyTable, {
      fields: [SiteAuditTable.companyId],
      references: [CompanyTable.id],
      relationName: "SiteAuditToCompany",
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

export const insertSiteAuditSchema = createInsertSchema(SiteAuditTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectSiteAuditSchema = createSelectSchema(SiteAuditTable);
export const updateSiteAuditSchema = createUpdateSchema(SiteAuditTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SiteAuditDataModel = typeof SiteAuditTable.$inferSelect;
export type InsertSiteAudit = z.infer<typeof insertSiteAuditSchema>;
export type SelectSiteAudit = z.infer<typeof selectSiteAuditSchema>;
export type UpdateSiteAudit = z.infer<typeof updateSiteAuditSchema>;

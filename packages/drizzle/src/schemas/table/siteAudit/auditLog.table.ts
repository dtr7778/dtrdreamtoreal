import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id } from "../../../db-utils";
import { AuditLogEventTypeEnum, AuditLogLevelEnum } from "../../enums/db-enums";
import { SiteAuditTable } from "./siteAudit.table";

export const AuditLogTable = pgTable(
  "audit_logs",
  {
    id: db_id,
    siteAuditId: uuid("site_audit_id").notNull(),
    sequence: integer("sequence").notNull(),
    type: AuditLogEventTypeEnum("type").notNull(),
    level: AuditLogLevelEnum("level").default("info").notNull(),
    message: text("message").notNull(),
    data: jsonb("data").$type<Record<string, unknown>>(),

    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "auditLog_siteAudit_fkey",
      columns: [table.siteAuditId],
      foreignColumns: [SiteAuditTable.id],
    }).onDelete("cascade"),
    uniqueIndex("auditLog_siteAuditId_sequence_uq").on(
      table.siteAuditId,
      table.sequence
    ),
    index("auditLog_siteAuditId_idx").on(table.siteAuditId),
    index("auditLog_type_idx").on(table.type),
    index("auditLog_level_idx").on(table.level),
  ]
);

export const AuditLogRelation = relations(AuditLogTable, ({ one }) => ({
  siteAudit: one(SiteAuditTable, {
    fields: [AuditLogTable.siteAuditId],
    references: [SiteAuditTable.id],
    relationName: "AuditLogToSiteAudit",
  }),
}));

export const insertAuditLogSchema = createInsertSchema(AuditLogTable).omit({
  id: true,
});
export const selectAuditLogSchema = createSelectSchema(AuditLogTable);
export const updateAuditLogSchema = createUpdateSchema(AuditLogTable).omit({
  id: true,
  siteAuditId: true,
  sequence: true,
  createdAt: true,
});

export type AuditLogDataModel = typeof AuditLogTable.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type SelectAuditLog = z.infer<typeof selectAuditLogSchema>;
export type UpdateAuditLog = z.infer<typeof updateAuditLogSchema>;

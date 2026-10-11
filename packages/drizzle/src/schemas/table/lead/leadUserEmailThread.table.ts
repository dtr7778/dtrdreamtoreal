import { relations } from "drizzle-orm";
import { foreignKey, index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type z from "zod";

import { db_created_at, db_id } from "../../db-utils";
import { EmailThreadTable } from "../email/emailThread.table";
import { LeadUserTable } from "./leadUser.table";

export const LeadUserEmailThreadTable = sqliteTable(
  "lead_user_email_threads",
  {
    id: db_id,
    leadUserId: text("lead_user_id").notNull(),
    emailThreadId: text("email_thread_id").notNull(),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "leadUserEmailThread_leadUserId_fkey",
      columns: [table.leadUserId],
      foreignColumns: [LeadUserTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "leadUserEmailThread_emailThreadId_fkey",
      columns: [table.emailThreadId],
      foreignColumns: [EmailThreadTable.id],
    }).onDelete("cascade"),
    index("leadUserEmailThread_leadUserId_idx").on(table.leadUserId),
    index("leadUserEmailThread_emailThreadId_idx").on(table.emailThreadId),
  ]
);

export const LeadUserEmailThreadRelation = relations(
  LeadUserEmailThreadTable,
  ({ one }) => ({
    leadUser: one(LeadUserTable, {
      fields: [LeadUserEmailThreadTable.leadUserId],
      references: [LeadUserTable.id],
      relationName: "LeadUserEmailThreadToLeadUser",
    }),
    emailThread: one(EmailThreadTable, {
      fields: [LeadUserEmailThreadTable.emailThreadId],
      references: [EmailThreadTable.id],
      relationName: "LeadUserEmailThreadToEmailThread",
    }),
  })
);

export const insertLeadUserEmailThreadSchema = createInsertSchema(
  LeadUserEmailThreadTable
).omit({
  id: true,
  createdAt: true,
});
export const selectLeadUserEmailThreadSchema = createSelectSchema(
  LeadUserEmailThreadTable
);

export type LeadUserEmailThreadDataModel =
  typeof LeadUserEmailThreadTable.$inferSelect;
export type InsertLeadUserEmailThread = z.infer<
  typeof insertLeadUserEmailThreadSchema
>;
export type SelectLeadUserEmailThread = z.infer<
  typeof selectLeadUserEmailThreadSchema
>;

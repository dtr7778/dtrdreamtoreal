import {
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../db-utils";
import { UserTable } from "./user/user.table";

export const SessionTable = pgTable(
  "sessions",
  {
    id: db_id,
    token: text("token").notNull(),
    ipAddress: varchar("ip_address", { length: 45 }), // IPv6 compatible
    userAgent: text("user_agent"),
    impersonatedBy: varchar("impersonated_by", { length: 255 }),
    userId: uuid("user_id").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      precision: 6,
    }).notNull(),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "session_user_fkey",
      columns: [table.userId],
      foreignColumns: [UserTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    uniqueIndex("session_token_idx").on(table.token),
    index("session_userId_idx").on(table.userId),
    index("session_expiresAt_idx").on(table.expiresAt),
  ]
);

export const SessionRelations = relations(SessionTable, ({ one }) => ({
  user: one(UserTable, {
    relationName: "SessionToUser",
    fields: [SessionTable.userId],
    references: [UserTable.id],
  }),
}));

export const insertSessionSchema = createInsertSchema(SessionTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectSessionSchema = createSelectSchema(SessionTable);
export const updateSessionSchema = createUpdateSchema(SessionTable);

export type SessionDataModel = typeof SessionTable.$inferSelect;
export type SelectSession = z.infer<typeof selectSessionSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;

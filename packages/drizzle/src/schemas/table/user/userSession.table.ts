import { relations } from "drizzle-orm";
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
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import { UserTable } from "./user.table";
import { UserDeviceTable } from "./userDevice.table";

export const UserSessionTable = pgTable(
  "user_sessions",
  {
    id: db_id,
    userId: uuid("user_id").notNull(),
    deviceId: uuid("device_id"),
    sessionId: text("session_id").notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    loginAt: timestamp("login_at", { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow(),
    logoutAt: timestamp("logout_at", { withTimezone: true, precision: 3 }),
    expiresAt: timestamp("expires_at", { withTimezone: true, precision: 3 }),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "user_session_user_fkey",
      columns: [table.userId],
      foreignColumns: [UserTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "user_session_device_fkey",
      columns: [table.deviceId],
      foreignColumns: [UserDeviceTable.id],
    }).onDelete("set null"),
    uniqueIndex("user_session_session_id_idx").on(table.sessionId),
    index("user_session_user_id_idx").on(table.userId),
    index("user_session_login_at_idx").on(table.loginAt),
    index("user_session_last_seen_at_idx").on(table.lastSeenAt),
  ]
);

export const UserSessionRelations = relations(UserSessionTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [UserSessionTable.userId],
    references: [UserTable.id],
    relationName: "UserSessionToUser",
  }),
  device: one(UserDeviceTable, {
    fields: [UserSessionTable.deviceId],
    references: [UserDeviceTable.id],
    relationName: "UserSessionToUserDevice",
  }),
}));

export const insertUserSessionSchema = createInsertSchema(
  UserSessionTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectUserSessionSchema = createSelectSchema(UserSessionTable);
export const updateUserSessionSchema = createUpdateSchema(
  UserSessionTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserSessionDataModel = typeof UserSessionTable.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type SelectUserSession = z.infer<typeof selectUserSessionSchema>;
export type UpdateUserSession = z.infer<typeof updateUserSessionSchema>;

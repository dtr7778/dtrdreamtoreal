import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
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

import { db_id } from "../../../db-utils";
import { SessionTable } from "../session.table";
import { UserTable } from "./user.table";

export const UserActivityTable = pgTable(
  "user_activities",
  {
    id: db_id,
    userId: uuid("user_id").notNull(),
    sessionId: uuid("session_id"),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    loginAt: timestamp("login_at", { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow(),
    logoutAt: timestamp("logout_at", { withTimezone: true, precision: 3 }),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true, precision: 3 })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      name: "user_activity_user_fkey",
      columns: [table.userId],
      foreignColumns: [UserTable.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "user_activity_session_fkey",
      columns: [table.sessionId],
      foreignColumns: [SessionTable.id],
    }).onDelete("set null"),
    index("user_activity_user_id_idx").on(table.userId),
    index("user_activity_login_at_idx").on(table.loginAt),
    index("session_activity_last_seen_at_idx").on(table.lastSeenAt),
  ]
);

export const UserActivityRelations = relations(
  UserActivityTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [UserActivityTable.userId],
      references: [UserTable.id],
      relationName: "UserToUserActivity",
    }),
    session: one(SessionTable, {
      fields: [UserActivityTable.sessionId],
      references: [SessionTable.id],
      relationName: "UserActivityToSession",
    }),
  })
);

export const insertUserActivitySchema = createInsertSchema(
  UserActivityTable
).omit({
  id: true,
});
export const selectUserActivitySchema = createSelectSchema(UserActivityTable);
export const updateUserActivitySchema = createUpdateSchema(
  UserActivityTable
).omit({
  id: true,
});

export type UserActivityDataModel = typeof UserActivityTable.$inferSelect;
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;
export type SelectUserActivity = z.infer<typeof selectUserActivitySchema>;

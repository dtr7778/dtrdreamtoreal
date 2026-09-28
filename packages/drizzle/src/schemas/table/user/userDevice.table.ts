import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import { UserTable } from "./user.table";
import { UserEventTable } from "./userEvent.table";
import { UserSessionTable } from "./userSession.table";

export const UserDeviceTable = pgTable(
  "user_devices",
  {
    id: db_id,
    userId: uuid("user_id").notNull(),
    fingerprint: text("fingerprint").notNull(),
    browser: text("browser"),
    os: text("os"),
    deviceType: text("device_type"),
    firstSeenAt: timestamp("first_seen_at", {
      withTimezone: true,
      precision: 3,
    })
      .notNull()
      .defaultNow(),
    lastSeenAt: timestamp("last_seen_at", {
      withTimezone: true,
      precision: 3,
    })
      .notNull()
      .defaultNow(),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "user_device_user_fkey",
      columns: [table.userId],
      foreignColumns: [UserTable.id],
    }).onDelete("cascade"),
    uniqueIndex("user_device_user_fingerprint_idx").on(
      table.userId,
      table.fingerprint
    ),
    index("user_device_user_id_idx").on(table.userId),
  ]
);

export const UserDeviceRelations = relations(
  UserDeviceTable,
  ({ one, many }) => ({
    user: one(UserTable, {
      fields: [UserDeviceTable.userId],
      references: [UserTable.id],
      relationName: "UserDeviceToUser",
    }),
    sessions: many(UserSessionTable, {
      relationName: "UserSessionToUserDevice",
    }),
    events: many(UserEventTable, {
      relationName: "UserEventToUserDevice",
    }),
  })
);

export const insertUserDeviceSchema = createInsertSchema(UserDeviceTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectUserDeviceSchema = createSelectSchema(UserDeviceTable);
export const updateUserDeviceSchema = createUpdateSchema(UserDeviceTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserDeviceDataModel = typeof UserDeviceTable.$inferSelect;
export type InsertUserDevice = z.infer<typeof insertUserDeviceSchema>;
export type SelectUserDevice = z.infer<typeof selectUserDeviceSchema>;
export type UpdateUserDevice = z.infer<typeof updateUserDeviceSchema>;

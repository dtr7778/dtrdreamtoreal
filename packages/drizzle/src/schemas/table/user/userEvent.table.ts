import { relations } from "drizzle-orm";
import {
  foreignKey,
  index,
  jsonb,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id } from "../../../db-utils";
import { UserEventTypeEnum } from "../../enums/db-enums";
import { UserTable } from "./user.table";
import { UserDeviceTable } from "./userDevice.table";

export const UserEventTable = pgTable(
  "user_events",
  {
    id: db_id,
    userId: uuid("user_id"),
    email: varchar("email", { length: 255 }),
    event: UserEventTypeEnum("event").notNull(),
    sessionId: text("session_id"),
    deviceId: uuid("device_id"),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: db_created_at,
  },
  (table) => [
    foreignKey({
      name: "user_event_user_fkey",
      columns: [table.userId],
      foreignColumns: [UserTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "user_event_device_fkey",
      columns: [table.deviceId],
      foreignColumns: [UserDeviceTable.id],
    }).onDelete("set null"),
    index("user_event_user_id_idx").on(table.userId),
    index("user_event_event_idx").on(table.event),
    index("user_event_created_at_idx").on(table.createdAt),
    index("user_event_session_id_idx").on(table.sessionId),
  ]
);

export const UserEventRelations = relations(UserEventTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [UserEventTable.userId],
    references: [UserTable.id],
    relationName: "UserEventToUser",
  }),
  device: one(UserDeviceTable, {
    fields: [UserEventTable.deviceId],
    references: [UserDeviceTable.id],
    relationName: "UserEventToUserDevice",
  }),
}));

export const insertUserEventSchema = createInsertSchema(UserEventTable).omit({
  id: true,
  createdAt: true,
});
export const selectUserEventSchema = createSelectSchema(UserEventTable);
export const updateUserEventSchema = createUpdateSchema(UserEventTable).omit({
  id: true,
  createdAt: true,
});

export type UserEventDataModel = typeof UserEventTable.$inferSelect;
export type InsertUserEvent = z.infer<typeof insertUserEventSchema>;
export type SelectUserEvent = z.infer<typeof selectUserEventSchema>;
export type UpdateUserEvent = z.infer<typeof updateUserEventSchema>;

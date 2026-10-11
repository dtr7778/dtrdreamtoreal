import { relations } from "drizzle-orm";
import {
  foreignKey,
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
import { NotificationCategoryEnum } from "../../enums/db-enums";
import { UserTable } from "./user.table";

export const NotificationSettingsTable = sqliteTable(
  "notification_settings",
  {
    id: db_id,
    userId: text("user_id").notNull(),
    category: NotificationCategoryEnum("category").notNull(),
    emailEnabled: integer("email_enabled", { mode: "boolean" })
      .default(true)
      .notNull(),
    pushEnabled: integer("push_enabled", { mode: "boolean" })
      .default(true)
      .notNull(),
    inAppEnabled: integer("in_app_enabled", { mode: "boolean" })
      .default(true)
      .notNull(),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "notification_settings_user_fkey",
      columns: [table.userId],
      foreignColumns: [UserTable.id],
    })
      .onDelete("cascade"),
    uniqueIndex("notification_settings_user_category_key").on(
      table.userId,
      table.category
    ),
  ]
);

export const NotificationSettingsRelations = relations(
  NotificationSettingsTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [NotificationSettingsTable.userId],
      references: [UserTable.id],
      relationName: "NotificationSettingToUser",
    }),
  })
);

export const insertNotificationSettingsSchema = createInsertSchema(
  NotificationSettingsTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectNotificationSettingsSchema = createSelectSchema(
  NotificationSettingsTable
);
export const updateNotificationSettingsSchema = createUpdateSchema(
  NotificationSettingsTable
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type NotificationSettingsDataModel =
  typeof NotificationSettingsTable.$inferSelect;
export type InsertNotificationSettings = z.infer<
  typeof insertNotificationSettingsSchema
>;
export type SelectNotificationSettings = z.infer<
  typeof selectNotificationSettingsSchema
>;
export type UpdateNotificationSettings = z.infer<
  typeof updateNotificationSettingsSchema
>;

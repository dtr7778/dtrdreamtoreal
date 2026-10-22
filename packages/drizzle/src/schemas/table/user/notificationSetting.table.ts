import { relations } from "drizzle-orm";
import {
  foreignKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import {
  db_bool,
  db_created_at,
  db_id,
  db_updated_at,
} from "../../../utils/db-utils";
import { NotificationCategoryEnum } from "../../enums/db-enums";
import { UserTable } from "./user.table";

export const NotificationSettingsTable = sqliteTable(
  "notification_settings",
  {
    id: db_id,
    userId: text("user_id").notNull(),
    category: NotificationCategoryEnum("category").notNull(),
    emailEnabled: db_bool("email_enabled").default(true).notNull(),
    pushEnabled: db_bool("push_enabled").default(true).notNull(),
    inAppEnabled: db_bool("in_app_enabled").default(true).notNull(),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "notification_settings_user_fkey",
      columns: [table.userId],
      foreignColumns: [UserTable.id],
    }).onDelete("cascade"),
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
  NotificationSettingsTable,
  {
    userId: z.uuid(),
  }
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectNotificationSettingsSchema = createSelectSchema(
  NotificationSettingsTable,
  {
    id: z.uuid(),
    userId: z.uuid(),
  }
);
export const updateNotificationSettingsSchema = createUpdateSchema(
  NotificationSettingsTable,
  {
    userId: z.uuid().optional(),
  }
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

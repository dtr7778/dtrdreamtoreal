import { relations } from "drizzle-orm";
import { foreignKey, index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import {
  db_bool,
  db_created_at,
  db_date,
  db_id,
  db_updated_at,
} from "../../../utils/db-utils";
import {
  NotificationCategoryEnum,
  NotificationLevelEnum,
} from "../../enums/db-enums";
import { UserTable } from "../user";

export const NotificationTable = sqliteTable(
  "notifications",
  {
    id: db_id,
    recipientId: text("recipient_id").notNull(),
    actorId: text("actor_id"),
    category: NotificationCategoryEnum("category").notNull(),
    level: NotificationLevelEnum("level").default("INFO").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    data: text("data", { mode: "json" }), // Stores contextual information (e.g., leadId, action links)
    isRead: db_bool("is_read").default(false).notNull(),
    readAt: db_date("read_at"),
    isArchived: db_bool("is_archived").default(false).notNull(),
    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [
    foreignKey({
      name: "notifications_recipient_fkey",
      columns: [table.recipientId],
      foreignColumns: [UserTable.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "notifications_actor_fkey",
      columns: [table.actorId],
      foreignColumns: [UserTable.id],
    }).onDelete("set null"),
    index("notifications_recipient_idx").on(table.recipientId),
    index("notifications_recipient_read_idx").on(
      table.recipientId,
      table.isRead
    ),
    index("notifications_created_at_idx").on(table.createdAt),
  ]
);

export const NotificationRelations = relations(
  NotificationTable,
  ({ one }) => ({
    recipient: one(UserTable, {
      fields: [NotificationTable.recipientId],
      references: [UserTable.id],
      relationName: "NotificationToRecipient",
    }),
    actor: one(UserTable, {
      fields: [NotificationTable.actorId],
      references: [UserTable.id],
      relationName: "NotificationToActor",
    }),
  })
);

export const insertNotificationSchema = createInsertSchema(NotificationTable, {
  recipientId: z.uuid(),
  actorId: z.uuid().nullish(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectNotificationSchema = createSelectSchema(NotificationTable, {
  id: z.uuid(),
  recipientId: z.uuid(),
  actorId: z.uuid().nullish(),
});
export const updateNotificationSchema = createUpdateSchema(NotificationTable, {
  recipientId: z.uuid().optional(),
  actorId: z.uuid().nullish(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type NotificationDataModel = typeof NotificationTable.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type SelectNotification = z.infer<typeof selectNotificationSchema>;
export type UpdateNotification = z.infer<typeof updateNotificationSchema>;

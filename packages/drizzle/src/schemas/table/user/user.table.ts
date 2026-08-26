import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../../db-utils";
import { RoleEnumSchema, RoleEnumType } from "../../enums/zod-db-enums";
import { AccountTable } from "../account.table";
import { ContactSubmissionReplyTable } from "../contact";
import { FileTable } from "../file.table";
import {
  NotificationSettingsTable,
  NotificationTable,
  PushSubscriptionTable,
} from "../notification";
import { UserRoleTable } from "../role-permission";
import { SessionTable } from "../session.table";
import { TaskTable } from "../task";

export const UserTable = pgTable(
  "users",
  {
    id: db_id,
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: varchar("image", { length: 255 }),
    role: varchar("role", { length: 255 }).$type<RoleEnumType>().notNull(),
    banned: boolean("banned").default(false),
    banReason: varchar("ban_reason", { length: 255 }),
    banExpires: timestamp("ban_expires", { withTimezone: true, precision: 3 }),

    // settings
    timezone: varchar("timezone", { length: 50 }).default("UTC").notNull(),
    locale: varchar("locale", { length: 10 }).default("en-US").notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),

    createdAt: db_created_at,
    updatedAt: db_updated_at,
  },
  (table) => [uniqueIndex("user_email_key").on(table.email)]
);

export const UserRelations = relations(UserTable, ({ many }) => ({
  sessions: many(SessionTable, {
    relationName: "SessionToUser",
  }),
  accounts: many(AccountTable, {
    relationName: "AccountToUser",
  }),
  contactReplies: many(ContactSubmissionReplyTable, {
    relationName: "ContactSubmissionReplyToUser",
  }),
  uploadedFiles: many(FileTable, {
    relationName: "FileUploadedBy",
  }),
  deletedFiles: many(FileTable, {
    relationName: "FileDeletedBy",
  }),
  roles: many(UserRoleTable, {
    relationName: "UserToUserRole",
  }),
  // notification
  notifications: many(NotificationTable, {
    relationName: "NotificationToRecipient",
  }),
  sentNotifications: many(NotificationTable, {
    relationName: "NotificationToActor",
  }),
  notificationSettings: many(NotificationSettingsTable, {
    relationName: "NotificationSettingToUser",
  }),
  pushSubscriptions: many(PushSubscriptionTable, {
    relationName: "PushSubscriptionToUser",
  }),
  assignedTasks: many(TaskTable, { relationName: "TaskToAssignedBy" }),
  createdTasks: many(TaskTable, { relationName: "TaskToCreatedBy" }),
}));

export const insertUserSchema = createInsertSchema(UserTable, {
  email: z.email(),
  image: z.url().nullable(),
  role: RoleEnumSchema,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectUserSchema = createSelectSchema(UserTable, {
  email: z.email(),
  image: z.url().nullable(),
  role: RoleEnumSchema,
});
export const updateUserSchema = createUpdateSchema(UserTable, {
  email: z.email().optional(),
  image: z.url().nullable(),
  role: RoleEnumSchema,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserDataModel = typeof UserTable.$inferSelect;
export type SelectUser = z.infer<typeof selectUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

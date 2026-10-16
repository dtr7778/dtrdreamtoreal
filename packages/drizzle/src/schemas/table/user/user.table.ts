import { relations } from "drizzle-orm";
import {
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
import z from "zod";

import { db_created_at, db_id, db_updated_at } from "../../db-utils";
import { RoleEnumSchema, type RoleEnumType } from "../../enums/zod-db-enums";
import { AccountTable } from "../account.table";
import { AiUsageTable } from "../aiUsage.table";
import {
  ChatMessageReactionTable,
  ChatMessageTable,
  ChatRoomMemberTable,
  ChatRoomTable,
} from "../chat";
import { ContactSubmissionReplyTable } from "../contact";
import { EmailThreadTable } from "../email";
import { FileTable } from "../file.table";
import { LeadCompanyTable, LeadUserTable } from "../lead";
import { NotificationTable } from "../notification";
import { UserRoleTable } from "../role-permission";
import { SessionTable } from "../session.table";
import { SiteAuditTable } from "../siteAudit";
import {
  CompanyTaskAssigneeTable,
  CompanyTaskTable,
  PersonalTaskTable,
} from "../task";
import { NotificationSettingsTable } from "./notificationSetting.table";
import { PushSubscriptionTable } from "./pushSubscription.table";
import { UserDeviceTable } from "./userDevice.table";
import { UserEventTable } from "./userEvent.table";
import { UserSessionTable } from "./userSession.table";

export const UserTable = sqliteTable(
  "users",
  {
    id: db_id,
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: integer("email_verified", { mode: "boolean" })
      .notNull()
      .default(false),
    image: text("image"),
    role: text("role").$type<RoleEnumType>().notNull(),
    banned: integer("banned", { mode: "boolean" }).default(false),
    banReason: text("ban_reason"),
    banExpires: integer("ban_expires", { mode: "timestamp_ms" }),

    // settings
    timezone: text("timezone").default("UTC").notNull(),
    locale: text("locale").default("en-US").notNull(),
    currency: text("currency").default("USD").notNull(),

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
  roles: many(UserRoleTable, {
    relationName: "UserRoleToUser",
  }),
  // file
  uploadedFiles: many(FileTable, {
    relationName: "FileUploadedToUser",
  }),
  deletedFiles: many(FileTable, {
    relationName: "FileDeletedToUser",
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
  // task
  companyTaskAssignments: many(CompanyTaskAssigneeTable, {
    relationName: "CompanyTaskAssigneeToUser",
  }),
  delegatedCompanyTasks: many(CompanyTaskTable, {
    relationName: "CompanyTaskToAssignedBy",
  }),
  createdCompanyTasks: many(CompanyTaskTable, {
    relationName: "CompanyTaskToCreatedBy",
  }),
  updatedCompanyTasks: many(CompanyTaskTable, {
    relationName: "CompanyTaskToUpdatedBy",
  }),
  personalTasks: many(PersonalTaskTable, {
    relationName: "PersonalTaskToUser",
  }),
  // email
  closedEmailThreads: many(EmailThreadTable, {
    relationName: "EmailThreadToClosedBy",
  }),
  contactReplies: many(ContactSubmissionReplyTable, {
    relationName: "ContactSubmissionReplyToUser",
  }),
  createdCompanies: many(LeadCompanyTable, { relationName: "CompanyToUser" }),
  createdEmployee: many(LeadUserTable, { relationName: "EmployeeToUser" }),
  siteAudits: many(SiteAuditTable, { relationName: "SiteAuditToTriggeredBy" }),
  aiUsages: many(AiUsageTable, { relationName: "AiUsageToUser" }),
  // auth sessions / devices / events
  loginSessions: many(UserSessionTable, {
    relationName: "UserSessionToUser",
  }),
  devices: many(UserDeviceTable, { relationName: "UserDeviceToUser" }),
  events: many(UserEventTable, { relationName: "UserEventToUser" }),
  // chat
  chatRoomMemberships: many(ChatRoomMemberTable, {
    relationName: "ChatRoomMemberToUser",
  }),
  createdChatRooms: many(ChatRoomTable, {
    relationName: "ChatRoomToCreatedBy",
  }),
  sendChatMessages: many(ChatMessageTable, {
    relationName: "ChatMessageToSender",
  }),
  chatMessageReactions: many(ChatMessageReactionTable, {
    relationName: "ChatMessageReactionToUser",
  }),
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
  id: z.uuid(),
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

import z from "zod";

import {
  ACTION_TYPE,
  CONTACT_STATUS,
  EMAIL_DIRECTION,
  EMAIL_EVENT_TYPE,
  EMAIL_RECIPIENT_TYPE,
  EMAIL_STATUS,
  FILE_ENTITY_TYPES,
  NOTIFICATION_CATEGORY,
  NOTIFICATION_LEVEL,
  PERMISSION_LEVEL,
  RESOURCE_TYPE,
  ROLES,
  TASK_PRIORITY,
  TASK_STATUS,
} from "./enum-values";

export const FileEntityTypeEnumSchema = z.enum(FILE_ENTITY_TYPES);
export type FileEntityTypeEnumType = z.infer<typeof FileEntityTypeEnumSchema>;

export const RoleEnumSchema = z.enum(ROLES);
export type RoleEnumType = z.infer<typeof RoleEnumSchema>;

export const PermissionLevelEnumSchema = z.enum(PERMISSION_LEVEL);
export type PermissionLevelEnumType = z.infer<typeof PermissionLevelEnumSchema>;

export const ResourceTypeEnumSchema = z.enum(RESOURCE_TYPE);
export type ResourceTypeEnumType = z.infer<typeof ResourceTypeEnumSchema>;

export const ActionTypeEnumSchema = z.enum(ACTION_TYPE);
export type ActionTypeEnumType = z.infer<typeof ActionTypeEnumSchema>;

export const EmailDirectionEnumSchema = z.enum(EMAIL_DIRECTION);
export type EmailDirectionEnumType = z.infer<typeof EmailDirectionEnumSchema>;

export const EmailStatusEnumSchema = z.enum(EMAIL_STATUS);
export type EmailStatusEnumType = z.infer<typeof EmailStatusEnumSchema>;

export const EmailEventTypeEnumSchema = z.enum(EMAIL_EVENT_TYPE);
export type EmailEventTypeEnumType = z.infer<typeof EmailEventTypeEnumSchema>;

export const EmailRecipientTypeEnumSchema = z.enum(EMAIL_RECIPIENT_TYPE);
export type EmailRecipientTypeEnumType = z.infer<
  typeof EmailRecipientTypeEnumSchema
>;

export const ContactStatusEnumSchema = z.enum(CONTACT_STATUS);
export type ContactStatusEnumType = z.infer<typeof ContactStatusEnumSchema>;

export const NotificationCategoryEnumSchema = z.enum(NOTIFICATION_CATEGORY);
export type NotificationCategoryEnumType = z.infer<
  typeof NotificationCategoryEnumSchema
>;

export const NotificationLevelEnumSchema = z.enum(NOTIFICATION_LEVEL);
export type NotificationLevelEnumType = z.infer<
  typeof NotificationLevelEnumSchema
>;

export const TaskStatusEnumSchema = z.enum(TASK_STATUS);
export type TaskStatusEnumType = z.infer<typeof TaskStatusEnumSchema>;

export const TaskPriorityEnumSchema = z.enum(TASK_PRIORITY);
export type TaskPriorityEnumType = z.infer<typeof TaskPriorityEnumSchema>;

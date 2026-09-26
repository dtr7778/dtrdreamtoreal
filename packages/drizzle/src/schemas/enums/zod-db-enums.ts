import z from "zod";

import {
  ACTION_TYPE,
  ADDRESS_TYPE,
  AUDIT_ITEM_STATUS,
  AUDIT_LOG_EVENT_TYPE,
  AUDIT_LOG_LEVEL,
  AUDIT_STATUS,
  CONTACT_STATUS,
  CWV_SOURCE,
  CWV_STRATEGY,
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
  SOCIAL_MEDIA_PLATFROM_TYPE,
  SOCIAL_MEDIA_TYPE,
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

export const AddressTypeEnumSchema = z.enum(ADDRESS_TYPE);
export type AddressTypeEnumType = z.infer<typeof AddressTypeEnumSchema>;

export const SocialMediaPlatfromTypeEnumSchema = z.enum(
  SOCIAL_MEDIA_PLATFROM_TYPE
);
export type SocialMediaPlatfromTypeEnumType = z.infer<
  typeof SocialMediaPlatfromTypeEnumSchema
>;

export const SocialMediaTypeEnumSchema = z.enum(SOCIAL_MEDIA_TYPE);
export type SocialMediaTypeEnumType = z.infer<typeof SocialMediaTypeEnumSchema>;

export const AuditStatusEnumSchema = z.enum(AUDIT_STATUS);
export type AudittatusEnumType = z.infer<typeof AuditStatusEnumSchema>;

export const AuditItemStatusEnumSchema = z.enum(AUDIT_ITEM_STATUS);
export type AuditItemStatusEnumType = z.infer<typeof AuditItemStatusEnumSchema>;

export const CwvStrategyEnumSchema = z.enum(CWV_STRATEGY);
export type CwvStrategyEnumType = z.infer<typeof CwvStrategyEnumSchema>;

export const CwvSourceEnumSchema = z.enum(CWV_SOURCE);
export type CwvSourceEnumType = z.infer<typeof CwvSourceEnumSchema>;

export const AuditLogLevelEnumSchema = z.enum(AUDIT_LOG_LEVEL);
export type AuditLogLevelEnumType = z.infer<typeof AuditLogLevelEnumSchema>;

export const AuditLogEventTypeEnumSchema = z.enum(AUDIT_LOG_EVENT_TYPE);
export type AuditLogEventTypeEnumType = z.infer<
  typeof AuditLogEventTypeEnumSchema
>;

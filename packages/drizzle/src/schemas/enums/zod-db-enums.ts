import z from "zod";

import {
  ACTION_TYPE,
  CONTACT_SUBMISSION_STATUS,
  FEEDBACK_ISSUE_STATUS,
  FEEDBACK_ISSUE_TYPE,
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

export const ContactSubmissionStatusEnumSchema = z.enum(
  CONTACT_SUBMISSION_STATUS
);
export type ContactSubmissionStatusEnumType = z.infer<
  typeof ContactSubmissionStatusEnumSchema
>;

export const NotificationCategoryEnumSchema = z.enum(NOTIFICATION_CATEGORY);
export type NotificationCategoryEnumType = z.infer<
  typeof NotificationCategoryEnumSchema
>;

export const NotificationLevelEnumSchema = z.enum(NOTIFICATION_LEVEL);
export type NotificationLevelEnumType = z.infer<
  typeof NotificationLevelEnumSchema
>;

export const FeedbackIssueTypeEnumSchema = z.enum(FEEDBACK_ISSUE_TYPE);
export type FeedbackIssueTypeEnumType = z.infer<
  typeof FeedbackIssueTypeEnumSchema
>;

export const FeedbackIssueStatusEnumSchema = z.enum(FEEDBACK_ISSUE_STATUS);
export type FeedbackIssueStatusEnumType = z.infer<
  typeof FeedbackIssueStatusEnumSchema
>;

export const TaskStatusEnumSchema = z.enum(TASK_STATUS);
export type TaskStatusEnumType = z.infer<typeof TaskStatusEnumSchema>;

export const TaskPriorityEnumSchema = z.enum(TASK_PRIORITY);
export type TaskPriorityEnumType = z.infer<typeof TaskPriorityEnumSchema>;

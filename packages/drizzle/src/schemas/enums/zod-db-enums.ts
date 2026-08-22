import z from "zod";

import {
  ACTION_TYPE,
  CONTACT_SUBMISSION_STATUS,
  FEEDBACK_ISSUE_STATUS,
  FEEDBACK_ISSUE_TYPE,
  NOTIFICATION_CATEGORY,
  NOTIFICATION_LEVEL,
  PERMISSION_LEVEL,
  PRIVATE_ENTITY_TYPES,
  PUBLIC_ENTITY_TYPES,
  RESOURCE_TYPE,
  ROLES,
} from "./enum-values";

export const PublicEntityTypeEnumSchema = z.enum(PUBLIC_ENTITY_TYPES);
export type PublicEntityTypeEnumType = z.infer<
  typeof PublicEntityTypeEnumSchema
>;

export const PrivateEntityTypeEnumSchema = z.enum(PRIVATE_ENTITY_TYPES);
export type PrivateEntityTypeEnumType = z.infer<
  typeof PrivateEntityTypeEnumSchema
>;

export const EntityTypeEnumSchema = PublicEntityTypeEnumSchema.or(
  PrivateEntityTypeEnumSchema
);
export type EntityTypeEnumType = z.infer<typeof EntityTypeEnumSchema>;

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

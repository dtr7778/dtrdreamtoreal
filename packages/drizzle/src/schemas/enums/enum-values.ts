export const FILE_ENTITY_TYPES = ["profile_image"] as const;

export const ROLES = ["USER", "SUPPORT_AGENT", "ADMIN", "SUPER_ADMIN"] as const;

export const PERMISSION_LEVEL = ["system", "self"] as const;
export const RESOURCE_TYPE = [
  "user",
  "role-permission",
  "invitation",
  "lead",
  "lead_mail",
  "task",
] as const;
export const ACTION_TYPE = [
  "create",
  "read",
  "list",
  "update",
  "delete",
  "manage",
  "export",
] as const;

export const FEEDBACK_ISSUE_TYPE = [
  "BUG",
  "FEATURE_REQUEST",
  "FEEDBACK",
  "SUGGESTION",
  "REPORT",
  "OTHER",
] as const;
export const FEEDBACK_ISSUE_STATUS = [
  "OPEN",
  "IN_PROGRESS",
  "NEEDS_INFO",
  "RESOLVED",
  "CLOSED",
] as const;

export const CONTACT_SUBMISSION_STATUS = [
  "PENDING",
  "READ",
  "REPLIED",
  "SPAM",
] as const;

export const NOTIFICATION_CATEGORY = [
  "SYSTEM",
  "AUTH",
  "SUPPORT",

  "LEAD",
] as const;
export const NOTIFICATION_LEVEL = [
  "INFO",
  "SUCCESS",
  "WARNING",
  "ERROR",
] as const;

export const TASK_STATUS = [
  "todo",
  "in_progress",
  "done",
  "cancelled",
] as const;

export const TASK_PRIORITY = ["low", "medium", "high"] as const;

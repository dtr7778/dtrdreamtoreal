export const FILE_ENTITY_TYPES = [
  "profile_image",
  "audit_report_image",
] as const;

export const ROLES = ["USER", "SUPPORT_AGENT", "ADMIN", "SUPER_ADMIN"] as const;

export const PERMISSION_LEVEL = ["system", "self"] as const;
export const RESOURCE_TYPE = [
  "user",
  "role-permission",
  "invitation",
  "lead",
  "lead_mail",
  "task",
  "contact",
  "company",
  "company_employee",
  "site_audit",
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

export const EMAIL_DIRECTION = ["outbound", "inbound", "web_form"] as const;
export const EMAIL_STATUS = [
  "draft",
  "queued",
  "sent",
  "received",
  "delivered",
  "delivery_delayed",
  "bounced",
  "complained",
  "suppressed",
  "failed",
] as const;
export const EMAIL_EVENT_TYPE = [
  "email.sent",
  "email.delivered",
  "email.delivery_delayed",
  "email.bounced",
  "email.complained",
  "email.opened",
  "email.clicked",
  "email.unsubscribed",
  "email.rejected",
] as const;
export const EMAIL_RECIPIENT_TYPE = [
  "to",
  "cc",
  "bcc",
  "reply_to",
  "from",
  "received_for",
] as const;

export const CONTACT_STATUS = [
  "pending",
  "processing",
  "replied",
  "closed",
  "spam",
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

export const ADDRESS_TYPE = [
  "billing",
  "shipping",
  "office",
  "home",
  "work",
  "other",
] as const;

export const SOCIAL_MEDIA_PLATFROM_TYPE = [
  "X",
  "linkedin",
  "facebook",
  "instagram",
  "youtube",
  "tiktok",
  "other",
] as const;

export const SOCIAL_MEDIA_TYPE = ["person", "company"] as const;

export const AUDIT_STATUS = [
  "pending",
  "running",
  "completed",
  "failed",
  "partial",
  "cancelled",
] as const;

export const AUDIT_ITEM_STATUS = [
  "pending",
  "running",
  "passed",
  "failed",
  "warning",
  "needs_review",
  "error",
  "skipped",
] as const;

export const CWV_STRATEGY = ["phone", "desktop"] as const;

export const CWV_SOURCE = ["psi", "crux", "crux_history", "bigquery"] as const;

export const AUDIT_LOG_LEVEL = ["debug", "info", "warn", "error"] as const;

export const AUDIT_LOG_EVENT_TYPE = [
  "run_started",
  "crawl_started",
  "crawl_finished",
  "tasks_planned",
  "check_started",
  "check_finished",
  "progress",
  "run_completed",
  "run_failed",
  "error",
  "report_started",
  "report_generated",
  "report_failed",
] as const;

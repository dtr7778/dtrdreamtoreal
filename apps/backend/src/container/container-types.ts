export const CONTAINER_TYPES = {
  Redis: Symbol.for("Redis"),
  Drizzle: Symbol.for("Drizzle"),

  EmailService: Symbol.for("EmailService"),
  EmailThreadService: Symbol.for("EmailThreadService"),

  Auth: Symbol.for("Auth"),
  Mailer: Symbol.for("Mailer"),
  Supabase: Symbol.for("Supabase"),
  Storage: Symbol.for("Storage"),

  MailService: Symbol.for("MailService"),
  MailQueueService: Symbol.for("MailQueueService"),
  AuditQueueService: Symbol.for("AuditQueueService"),
  AuditLogService: Symbol.for("AuditLogService"),
  AuditService: Symbol.for("AuditService"),
};

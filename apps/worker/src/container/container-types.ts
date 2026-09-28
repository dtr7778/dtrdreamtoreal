export const CONTAINER_TYPES = {
  Redis: Symbol.for("Redis"),
  Drizzle: Symbol.for("Drizzle"),
  Logger: Symbol.for("Logger"),
  Supabase: Symbol.for("Supabase"),
  Storage: Symbol.for("Storage"),

  EmailService: Symbol.for("EmailService"),
  EmailThreadService: Symbol.for("EmailThreadService"),

  GoogleApiCache: Symbol.for("GoogleApiCache"),
  PsiClient: Symbol.for("PsiClient"),
  CruxClient: Symbol.for("CruxClient"),

  ResendMailTransport: Symbol.for("ResendMailTransport"),

  AuditQueueService: Symbol.for("AuditQueueService"),
  AuditReportQueueService: Symbol.for("AuditReportQueueService"),

  AuditService: Symbol.for("AuditService"),
  AuditLogService: Symbol.for("AuditLogService"),
  AuditReportService: Symbol.for("AuditReportService"),

  AuditCronService: Symbol.for("AuditCronService"),
};

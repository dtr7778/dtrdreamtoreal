export const WORKER_CONTAINER_TYPES = {
  Drizzle: Symbol.for("Drizzle"),
  Redis: Symbol.for("Redis"),
  Logger: Symbol.for("Logger"),
  Supabase: Symbol.for("Supabase"),
  Storage: Symbol.for("Storage"),

  EmailService: Symbol.for("EmailService"),
  EmailThreadService: Symbol.for("EmailThreadService"),

  GoogleApiCache: Symbol.for("GoogleApiCache"),
  PsiClient: Symbol.for("PsiClient"),
  CruxClient: Symbol.for("CruxClient"),

  ResendMailTransport: Symbol.for("ResendMailTransport"),

  AuditService: Symbol.for("AuditService"),
  AuditQueueService: Symbol.for("AuditQueueService"),
  AuditReportQueueService: Symbol.for("AuditReportQueueService"),
  AuditLogService: Symbol.for("AuditLogService"),
  AuditReportImageService: Symbol.for("AuditReportImageService"),
};

export const CONTAINER_TYPES = {
  Drizzle: Symbol.for("Drizzle"),
  Redis: Symbol.for("Redis"),
  Logger: Symbol.for("Logger"),

  EmailService: Symbol.for("EmailService"),
  EmailThreadService: Symbol.for("EmailThreadService"),

  Auth: Symbol.for("Auth"),
  Mailer: Symbol.for("Mailer"),

  GoogleApiCache: Symbol.for("GoogleApiCache"),

  PsiClient: Symbol.for("PsiClient"),
  CruxClient: Symbol.for("CruxClient"),

  MailService: Symbol.for("MailService"),
  MailQueueService: Symbol.for("MailQueueService"),
  QueueSignatureService: Symbol.for("QueueSignatureService"),
  AuditQueueService: Symbol.for("AuditQueueService"),
  AuditLogService: Symbol.for("AuditLogService"),
  AuditService: Symbol.for("AuditService"),
};

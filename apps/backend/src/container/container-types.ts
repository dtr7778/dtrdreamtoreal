export const CONTAINER_TYPES = {
  Drizzle: Symbol.for("Drizzle"),
  Redis: Symbol.for("Redis"),
  Logger: Symbol.for("Logger"),

  GoogleApiCache: Symbol.for("GoogleApiCache"),

  PsiClient: Symbol.for("PsiClient"),
  CruxClient: Symbol.for("CruxClient"),

  MailQueueService: Symbol.for("MailQueueService"),
  MailProcessorService: Symbol.for("MailProcessorService"),
  QueueSignatureService: Symbol.for("QueueSignatureService"),
  AuditQueueService: Symbol.for("AuditQueueService"),
  AuditService: Symbol.for("AuditService"),
};

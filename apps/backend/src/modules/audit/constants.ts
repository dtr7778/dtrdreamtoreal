export const AUDIT_REDIS_KEYS = {
  crawl: (siteId: string) => `audit:crawl:${siteId}`,
  progress: (auditRunId: string) => `audit:run:${auditRunId}:progress`,
  total: (auditRunId: string) => `audit:run:${auditRunId}:total`,
  idempotency: (jobId: string) => `audit:job:${jobId}:lock`,
  logStream: (siteAuditId: string) => `audit:log:${siteAuditId}`,
  logSequence: (siteAuditId: string) => `audit:log:${siteAuditId}:sequence`,
  finalized: (siteAuditId: string) => `audit:run:${siteAuditId}:finalized`,
} as const;

export const AUDIT_DEFAULTS = {
  crawlMaxPages: 25,
  crawlMaxDepth: 3,
  crawlCacheTtlSeconds: 60 * 60,
  runTotalTtlSeconds: 60 * 60 * 24,
  idempotencyLockTtlSeconds: 60 * 60,
  jobRetries: 3,
  maxPagesPerCheck: 5,
  maxFanOutMessages: 400,
  logStreamMaxLen: 5000,
  logStreamTtlSeconds: 60 * 60 * 24,
} as const;

export const AUDIT_CRON = {
  countryCwvSync: "0 4 1 * *",
} as const;

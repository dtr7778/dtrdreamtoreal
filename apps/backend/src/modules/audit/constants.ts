export const AUDIT_REDIS_KEYS = {
  crawl: (siteId: string) => `audit:crawl:${siteId}`,
  progress: (auditRunId: string) => `audit:run:${auditRunId}:progress`,
  total: (auditRunId: string) => `audit:run:${auditRunId}:total`,
  idempotency: (jobId: string) => `audit:job:${jobId}:lock`,
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
} as const;

export const AUDIT_CRON = {
  countryCwvSync: "0 4 1 * *",
} as const;

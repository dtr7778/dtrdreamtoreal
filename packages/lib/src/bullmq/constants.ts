/**
 * Fallback values used by the BullMQ message log repository when the caller
 * does not supply an explicit value.
 */
export const BULLMQ_LOG_DEFAULTS = {
  /** TTL (seconds) applied to each stored job log. */
  ttlSeconds: 86_400 * 7,
  /** TTL (seconds) applied to the per-queue log index. */
  indexTtlSeconds: 86_400 * 30,
  /** Default page size when listing logged jobs. */
  listLimit: 50,
} as const;

/** Redis key prefixes owned by the BullMQ message log repository. */
export const BULLMQ_KEY_PREFIX = {
  /** Hash per job: `bullmq:log:<queueName>:<jobId>`. */
  log: "bullmq:log",
  /** Sorted set per queue, scored by creation time: `bullmq:log:index:<queueName>`. */
  index: "bullmq:log:index",
} as const;

export const BULLMQ_DEFAULT_PREFIX = "bull";

/**
 * Service-wide fallback values used by the BullMQ producer when the caller does
 * not supply an explicit configuration value.
 */
export const BULLMQ_TRANSPORT_DEFAULTS = {
  /** Retries used when neither the job nor the config sets one. */
  retries: 3,
  /** HMAC algorithm used to sign and verify job payloads. */
  signatureAlgorithm: "sha256",
} as const;

/** HTTP headers carried by signed BullMQ enqueue requests. */
export const BULLMQ_TRANSPORT_HEADERS = {
  /** HMAC signature of the request payload. */
  signature: "x-bullmq-signature",
  /** BullMQ job id echoed back to the producer. */
  jobId: "x-bullmq-job-id",
} as const;

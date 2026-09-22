/**
 * Service-wide fallback values used when the caller does not supply an explicit
 * configuration value.
 */
export const QSTASH_DEFAULTS = {
  /** Retries used when neither the message nor the config sets one. */
  retries: 3,
  /** Base delay (ms) for the exponential retry backoff. */
  retryDelayMs: 1000,
  /** Default page size when listing dead letters. */
  dlqListLimit: 50,
} as const;

/** Redis key prefixes owned by the QStash service. */
export const QSTASH_KEY_PREFIX = {
  log: "qstash:log",
  body: "qstash:body",
  dedup: "qstash:dedup",
  deadLetterSet: "qstash:dlq",
  deadLetterSorted: "qstash:dlq:sorted",
} as const;

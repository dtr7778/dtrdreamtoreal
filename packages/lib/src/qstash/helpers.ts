import { createHash, randomUUID } from "node:crypto";

import { QSTASH_KEY_PREFIX } from "./constants";
import { QstashError } from "./QstashError";
import type {
  ContentType,
  QstashMessage,
  QstashMessageLog,
  QstashPublishOptions,
} from "./types";

/** Normalized publish options with every default applied. */
export interface NormalizedPublishOptions<T> {
  url: string;
  body: T;
  deduplicationId: string;
  maxRetries: number;
  callback: string | null;
  failureCallback: string | null;
  contentType: ContentType;
  headers: Record<string, string>;
  delay?: number;
  notBefore?: number;
  queueName?: string;
  /** Absolute delivery timestamp (ms) derived from `delay` / `notBefore`. */
  scheduledAt: number;
}

/** Build the exponential-backoff expression accepted by QStash. */
export function retryDelayExpression(baseDelayMs: number): string {
  return `pow(2, retried) * ${baseDelayMs}`;
}

/** Generate a unique deduplication id for a publish. */
export function generateDedupId(): string {
  return `dedup_${Date.now()}_${randomUUID().slice(0, 8)}`;
}

/**
 * Resolve the absolute delivery timestamp (ms) from the relative `delay`
 * (seconds) or absolute `notBefore` (unix seconds). Defaults to now.
 */
export function resolveScheduledAt(delay?: number, notBefore?: number): number {
  if (notBefore !== undefined) return notBefore * 1000;
  if (delay !== undefined) return Date.now() + delay * 1000;
  return Date.now();
}

/**
 * Apply service defaults to caller-supplied publish options, producing the
 * canonical shape used by both single and batch publishing.
 */
export function normalizePublishOptions<T>(
  options: QstashPublishOptions<T>,
  defaultRetries: number
): NormalizedPublishOptions<T> {
  const {
    url,
    body,
    deduplicationId,
    retries,
    callback,
    failureCallback,
    contentType = "json",
    headers = {},
    delay,
    notBefore,
    queueName,
  } = options;

  return {
    url,
    body,
    deduplicationId: deduplicationId ?? generateDedupId(),
    maxRetries: retries ?? defaultRetries,
    callback,
    failureCallback,
    contentType,
    headers,
    delay,
    notBefore,
    queueName,
    scheduledAt: resolveScheduledAt(delay, notBefore),
  };
}

/** Build a fresh message log entry in the `pending` state. */
export function toLogEntry<T>(
  normalized: NormalizedPublishOptions<T>,
  messageId: string
): QstashMessageLog {
  return {
    messageId,
    deduplicationId: normalized.deduplicationId,
    state: "pending",
    retried: 0,
    maxRetries: normalized.maxRetries,
    url: normalized.url,
    callback: normalized.callback,
    failureCallback: normalized.failureCallback,
    contentType: normalized.contentType,
    deliveredAt: null,
    isDeadLetter: false,
    createdAt: Date.now(),
    scheduledAt: normalized.scheduledAt,
  };
}

/** Project a stored log into the lightweight public message view. */
export function toMessageView(log: QstashMessageLog): QstashMessage {
  return {
    messageId: log.messageId,
    state: log.state,
    deliveredAt: log.deliveredAt,
    isDeadLetter: log.isDeadLetter,
    createdAt: log.createdAt,
    scheduledAt: log.scheduledAt,
  };
}

/** Assert that a message log exists, throwing a 404 otherwise. */
export function requireLog(
  log: QstashMessageLog | null,
  messageId: string
): QstashMessageLog {
  if (!log) {
    throw new QstashError(
      `Message log not found: ${messageId}`,
      "QSTASH_LOG_NOT_FOUND",
      404,
      { messageId }
    );
  }
  return log;
}

/**
 * Derive a deterministic Redis key from content, used to suppress duplicate
 * publishes within a scope.
 */
export function buildDedupKey(content: unknown, scope = "default"): string {
  const str = typeof content === "string" ? content : JSON.stringify(content);
  const hash = createHash("sha256")
    .update(`${scope}:${str}`)
    .digest("hex")
    .slice(0, 32);
  return `${QSTASH_KEY_PREFIX.dedup}:${hash}`;
}

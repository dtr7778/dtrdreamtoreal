import type { ExtendedRedis } from "../redis";

// ─── Message domain model ───────────────────────────────────────────────────

/**
 * How a message body is serialized before being handed to QStash and stored
 * in Redis.
 *
 * - `json`: the body is JSON encoded/decoded.
 * - `text`: the body is stored/sent as a plain string.
 */
export type ContentType = "json" | "text";

/**
 * Lifecycle states tracked for every message the service publishes.
 *
 * - `pending`     – accepted by QStash, not yet delivered.
 * - `delivered`   – the destination (or callback) acknowledged the message.
 * - `failed`      – the destination returned an error; retries may follow.
 * - `retrying`    – manually re-published after a failure.
 * - `dead_letter` – retries were exhausted and the message was moved to the DLQ.
 */
export type QstashMessageState =
  | "pending"
  | "delivered"
  | "failed"
  | "retrying"
  | "dead_letter";

/**
 * Persisted record of a single published message.
 *
 * Stored as a Redis hash (`qstash:log:<messageId>`) with the raw body stored
 * separately (`qstash:body:<messageId>`) so the body can be replayed on retry.
 */
export interface QstashMessageLog {
  /** QStash message id returned by the publish call. */
  messageId: string;
  /** Deduplication id used to suppress duplicate publishes. */
  deduplicationId: string;
  /** Current lifecycle state. */
  state: QstashMessageState;
  /** Number of delivery attempts observed so far. */
  retried: number;
  /** Maximum retries configured for the message. */
  maxRetries: number;
  /** Destination URL the message is delivered to. */
  url: string;
  /** Optional callback URL invoked with the destination response. */
  callback: string | null;
  /** Optional URL invoked when delivery exhausts all retries. */
  failureCallback: string | null;
  /** Whether the message has been moved to the dead letter queue. */
  isDeadLetter: boolean;
  /** Serialization format of the stored body. */
  contentType: ContentType;
  /** Timestamp (ms) the message was delivered, or `null`. */
  deliveredAt: number | null;
  /** Timestamp (ms) the message was published. */
  createdAt: number;
  /** Timestamp (ms) the message is scheduled for delivery, or `null`. */
  scheduledAt: number | null;
}

/**
 * Lightweight, public projection of {@link QstashMessageLog} used when listing
 * or reading messages through the API.
 */
export type QstashMessage = Pick<
  QstashMessageLog,
  | "messageId"
  | "state"
  | "deliveredAt"
  | "isDeadLetter"
  | "createdAt"
  | "scheduledAt"
>;

/**
 * Lightweight projection of a message that currently sits in the dead letter
 * queue.
 */
export type QstashDeadLetter = Pick<
  QstashMessageLog,
  "messageId" | "retried" | "createdAt"
>;

// ─── Configuration ──────────────────────────────────────────────────────────

/** Connection settings for the underlying QStash REST client. */
export interface QstashClientConfig {
  /** QStash API base URL. */
  baseUrl: string;
  /** QStash API token. */
  token: string;
  /** Base delay (ms) used for the exponential backoff retry strategy. */
  defaultRetryDelay?: number;
}

/** Signing keys used to verify inbound QStash requests. */
export interface QstashReceiverConfig {
  /** Key currently used by QStash to sign requests. */
  currentSigningKey: string;
  /** Next signing key, accepted during key rotation. */
  nextSigningKey: string;
}

/** External dependencies required by {@link QstashService}. */
export interface QstashServiceDependencies {
  /** Redis client used to persist message logs and the dead letter queue. */
  redisClient: ExtendedRedis;
}

/** Full configuration accepted by {@link QstashService}. */
export interface QstashServiceConfig
  extends QstashClientConfig, QstashReceiverConfig, QstashServiceDependencies {
  /** Default number of delivery retries. Falls back to the service default. */
  defaultRetries?: number;
  /** Topic used by default when publishing (takes precedence over the queue). */
  defaultTopic?: string;
  /** Queue used by default when no explicit `queueName` is provided. */
  defaultQueue?: string;
}

/**
 * Payload QStash posts to a callback / failure callback URL, as documented by
 * Upstash.
 */
export interface QstashReceiptPayload {
  /** HTTP status returned by the destination. */
  status: number;
  /** Headers returned by the destination. */
  header: Record<string, unknown>;
  /** Body returned by the destination. */
  body: string;
  /** Number of retries already performed. */
  retried: number;
  /** Dead letter queue id, when the message was forwarded to the DLQ. */
  dlqId?: string;
  /** Id of the message that triggered the callback. */
  sourceMessageId: string;
  /** Destination URL. */
  url: string;
  /** HTTP method used to call the destination. */
  method: string;
  /** Headers originally sent to the destination. */
  sourceHeader: Record<string, unknown>;
  /** Body originally sent to the destination. */
  sourceBody: string;
  /** Failure callback URL configured on the message. */
  failureCallback: string;
  /** Maximum number of retries configured on the message. */
  maxRetries: number;
  /** Absolute timestamp (seconds) the message was allowed to be delivered. */
  notBefore: number;
  /** Timestamp (seconds) the message was created. */
  createdAt: number;
  /** Id of the callback message itself. */
  messageId: string;
}

// ─── Publish API ────────────────────────────────────────────────────────────

/** Options accepted by `publish`, `publishBatch` and `scheduleQueue`. */
export interface QstashPublishOptions<T = unknown> {
  /** Destination URL QStash delivers to. */
  url: string;
  /** Message body. */
  body: T;
  /** Explicit deduplication id. Generated when omitted. */
  deduplicationId?: string;
  /** Retry override for this message. */
  retries?: number;
  /** Callback URL invoked with the destination response. */
  callback: string | null;
  /** URL invoked when all retries are exhausted. */
  failureCallback: string | null;
  /** Body serialization format. Defaults to `json`. */
  contentType?: ContentType;
  /** Extra headers forwarded with the request. */
  headers?: Record<string, string>;
  /** Logical route key used to look up registered handlers. */
  routeKey?: string;
  /** Delay delivery by this many seconds. */
  delay?: number;
  /** Absolute delivery time as a unix timestamp (seconds); overrides `delay`. */
  notBefore?: number;
  /** Enqueue onto this queue instead of the configured default transport. */
  queueName?: string;
}

/** Result returned for every successfully published message. */
export interface QstashPublishResult {
  /** QStash message id. */
  messageId: string;
  /** Deduplication id used for the publish. */
  deduplicationId: string;
}

/** Handler invoked when a QStash message is delivered to the service. */
export type QstashCallbackHandler<T = unknown> = (
  payload: T,
  context: { messageId: string }
) => Promise<unknown>;

/** Handler invoked to process a delivery receipt for a route. */
export type QstashReceiptHandler = (messageId: string) => Promise<void>;

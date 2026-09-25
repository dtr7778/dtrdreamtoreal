// ─── Enqueue (publisher) contract ───────────────────────────────────────────

/**
 * Canonical enqueue request handed to an {@link IBullmqPublisher}.
 *
 * The publisher is app-specific: it maps `queue`/`job` onto the matching
 * backend contract (e.g. the mail queue) and ships {@link payload}.
 */
export interface BullmqEnqueueRequest<T> {
  /** Logical queue key, used by the publisher to pick the backend contract. */
  queue: string;
  /** Job name forwarded to the backend queue. */
  job: string;
  /** Job payload delivered to the worker. */
  payload: T;
  /** Generated job id (used as the backend BullMQ job id). */
  jobId: string;
  /** Delivery attempts override. */
  retries?: number;
  /** Delay delivery by this many seconds. */
  delay?: number;
}

/** Result returned for every accepted enqueue call. */
export interface BullmqEnqueueResult {
  /** Backend job/message id. */
  messageId: string;
  /** Queue the job was enqueued on. */
  queue: string;
}

/** Per-item result of an {@link IBullmqPublisher.enqueueBatch} call. */
export interface BullmqBatchEnqueueResult {
  success: boolean;
  /** Backend job/message id (present when `success`). */
  messageId?: string;
  /** Queue the item was enqueued on (present when `success`). */
  queue?: string;
  /** Failure reason (present when not `success`). */
  error?: string;
}

/**
 * Canonical batch enqueue request handed to an {@link IBullmqPublisher}.
 *
 * A single transport call carries every item; the backend fans them out into
 * individual jobs and reports one result per item, in order.
 */
export interface BullmqEnqueueBatchRequest<T> {
  /** Logical queue key, used by the publisher to pick the backend contract. */
  queue: string;
  /** Job name forwarded to the backend queue. */
  job: string;
  /** Item payloads, in caller order. */
  payloads: T[];
  /** Generated job ids, one per payload. */
  jobIds: string[];
  /** Delivery attempts override. */
  retries?: number;
  /** Delay delivery by this many seconds. */
  delay?: number;
}

/**
 * Transport used by {@link BullmqService} to reach the backend broker.
 *
 * Implemented at the app layer (e.g. with `@workspace/contract`'s apiClient) so
 * `@workspace/lib` stays free of a dependency on the contract package.
 */
export interface IBullmqPublisher {
  /** Enqueue a single signed request. */
  enqueue<T>(
    request: BullmqEnqueueRequest<T>,
    signature: string
  ): Promise<BullmqEnqueueResult>;
  /** Enqueue several signed item payloads in a single transport call. */
  enqueueBatch<T>(
    request: BullmqEnqueueBatchRequest<T>,
    signature: string
  ): Promise<BullmqBatchEnqueueResult[]>;
}

// ─── Configuration ──────────────────────────────────────────────────────────

/** Configuration accepted by {@link BullmqService}. */
export interface BullmqClientServiceConfig {
  /** Shared secret used to sign enqueues and verify inbound enqueues. */
  signingSecret: string;
  /** Transport that reaches the backend enqueue endpoints. */
  publisher: IBullmqPublisher;
  /** Default number of delivery attempts. Falls back to the service default. */
  defaultRetries?: number;
}

// ─── Enqueue API ────────────────────────────────────────────────────────────

/** Options accepted by {@link BullmqService.enqueue}. */
export interface BullmqEnqueueOptions<T = unknown> {
  /** Logical queue key. */
  queue: string;
  /** Job name. */
  job: string;
  /** Job payload. */
  payload: T;
  /** Delivery attempts override. */
  retries?: number;
  /** Delay delivery by this many seconds. */
  delay?: number;
}

// ─── Enqueue (publisher) contract ───────────────────────────────────────────

/**
 * Canonical enqueue request handed to an {@link IBullmqPublisher}.
 *
 * The publisher is app-specific: it maps `queue`/`job` onto the matching
 * backend contract (e.g. the mail queue) and ships {@link payload}.
 */
export interface BullmqEnqueueRequest<T = unknown> {
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

/**
 * Transport used by {@link BullmqService} to reach the backend broker.
 *
 * Implemented at the app layer (e.g. with `@workspace/contract`'s apiClient) so
 * `@workspace/lib` stays free of a dependency on the contract package.
 */
export interface IBullmqPublisher {
  /** Enqueue a single signed request. */
  enqueue<T = unknown>(
    request: BullmqEnqueueRequest<T>,
    signature: string
  ): Promise<BullmqEnqueueResult>;
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

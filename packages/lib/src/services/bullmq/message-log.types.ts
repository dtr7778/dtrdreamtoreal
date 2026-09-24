import type { JobState } from "bullmq";

/**
 * Lifecycle states tracked for every job the message log records.
 *
 * Mirrors BullMQ's own {@link JobState} values and adds two service-level
 * states:
 *
 * - `retrying`    – a failed job that was manually re-enqueued.
 * - `dead_letter` – a job that exhausted every attempt and will not be
 *   processed again.
 * - `unknown`     – BullMQ could not resolve the job's current state.
 */
export type BullmqMessageState = JobState | "retrying" | "dead_letter" | "unknown";

/**
 * Persisted record of a single job's lifecycle.
 *
 * Stored as a Redis hash (`bullmq:log:<queueName>:<jobId>`) and indexed in a
 * per-queue sorted set so logs can be listed newest-first.
 *
 * Unlike the QStash log, the job payload is **not** duplicated here: BullMQ
 * already persists job data in Redis. This log provides a durable,
 * `removeOnComplete`/`removeOnFail`-proof audit trail instead.
 */
export interface BullmqMessageLog {
  /** BullMQ job id. */
  jobId: string;
  /** Queue the job belongs to. */
  queueName: string;
  /** BullMQ job name (the contract job name). */
  jobName: string;
  /** Current lifecycle state. */
  state: BullmqMessageState;
  /** Number of attempts made so far. */
  attempts: number;
  /** Maximum attempts configured via `opts.attempts` (defaults to 1). */
  maxAttempts: number;
  /** Job priority, or `null` when unset. */
  priority: number | null;
  /** Failure reason reported by BullMQ, or `null`. */
  failedReason: string | null;
  /** Whether the job exhausted every attempt. */
  isDeadLetter: boolean;
  /** Fully qualified parent key when the job is a flow child, or `null`. */
  parentKey: string | null;
  /** Deduplication id used to add the job, or `null`. */
  deduplicationId: string | null;
  /** Timestamp (ms) the job was created. */
  createdAt: number;
  /** Timestamp (ms) the job started processing, or `null`. */
  processedAt: number | null;
  /** Timestamp (ms) the job finished (completed or failed), or `null`. */
  finishedAt: number | null;
  /** Timestamp (ms) the job is scheduled for, or `null` when not delayed. */
  scheduledAt: number | null;
}

/**
 * Lightweight, public projection of {@link BullmqMessageLog} used when listing
 * or reading messages.
 */
export type BullmqMessage = Pick<
  BullmqMessageLog,
  | "jobId"
  | "queueName"
  | "jobName"
  | "state"
  | "attempts"
  | "createdAt"
  | "finishedAt"
  | "isDeadLetter"
>;
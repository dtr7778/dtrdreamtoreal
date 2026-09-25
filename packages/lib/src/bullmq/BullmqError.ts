import { ServiceError } from "../utils";

/**
 * Stable error codes emitted by the BullMQ producer.
 *
 * Consumers can switch on these without depending on human-readable messages.
 */
export type BullmqErrorCode =
  | "BULLMQ_CONFIG_INVALID"
  | "BULLMQ_ENQUEUE_FAILED"
  | "BULLMQ_SIGNATURE_INVALID"
  | "BULLMQ_INVALID_PAYLOAD";

/**
 * Error thrown by BullMQ producer operations.
 *
 * Carries a machine-readable {@link BullmqErrorCode}, an HTTP status code and
 * optional metadata for logging/debugging.
 */
export class BullmqError extends ServiceError {
  constructor(
    message: string,
    code: BullmqErrorCode,
    statusCode: number = 500,
    metadata?: Record<string, unknown>
  ) {
    super(message, code, statusCode, metadata);
  }
}
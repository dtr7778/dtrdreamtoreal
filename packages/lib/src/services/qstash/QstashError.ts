import { ServiceError } from "../../utils";

export type QstashErrorCode =
  | "QSTASH_CLIENT_INIT_FAILED"
  | "QSTASH_RECEIVER_INIT_FAILED"
  | "QSTASH_PUBLISH_FAILED"
  | "QSTASH_SIGNATURE_INVALID"
  | "QSTASH_CALLBACK_FAILED"
  | "QSTASH_LOG_NOT_FOUND"
  | "QSTASH_RECEIPT_PROCESSING_FAILED"
  | "QSTASH_CALLBACK_HANDLER_MISSING"
  | "QSTASH_VERIFICATION_ERROR"
  | "QSTASH_CONFIG_INVALID"
  | "QSTASH_RETRY_EXHAUSTED"
  | "QSTASH_RETRY_BODY_MISSING"
  | "QSTASH_RETRY_INVALID_STATE"
  | "QSTASH_INVALID_PAYLOAD"
  | "QSTASH_INVALID_MESSAGE_ID";

export class QstashError extends ServiceError {
  constructor(
    message: string,
    code: QstashErrorCode,
    statusCode: number = 500,
    metadata?: Record<string, unknown>
  ) {
    super(message, code, statusCode, metadata);
  }
}

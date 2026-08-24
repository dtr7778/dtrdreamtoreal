import { ServiceError } from "@workspace/lib/utils";

export class MailError extends ServiceError {
  constructor(
    message: string,
    code: MailErrorCode,
    statusCode: number = 500,
    metadata?: Record<string, unknown>
  ) {
    super(message, code, statusCode, metadata);
  }
}

export type MailErrorCode =
  | "MAIL_INVALID_PAYLOAD"
  | "MAIL_RATE_LIMITED"
  | "MAIL_DUPLICATE_SUPPRESSED"
  | "MAIL_TRANSPORT_FAILED"
  | "MAIL_RECIPIENT_INVALID"
  | "MAIL_CONNECTION_FAILED"
  | "MAIL_SMTP_AUTH_FAILED";

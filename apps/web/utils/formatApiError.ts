import { QstashError } from "@workspace/lib/qstash/error";
import { MailError } from "@workspace/mail/error";

export interface FormattedError {
  message: string;
  statusCode: number;
}

export function formatApiError(error: unknown): FormattedError {
  if (error instanceof QstashError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof MailError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
    };
  }

  return {
    message: "An unexpected error occurred",
    statusCode: 500,
  };
}

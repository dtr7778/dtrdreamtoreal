import type { ApiResponseType } from "@workspace/lib/types";

export class ApiError extends Error {
  public statusCode: number;
  public cause?: unknown | undefined;
  public stackTrace?: string | undefined;

  constructor({
    message,
    statusCode,
    cause,
    stack,
  }: {
    message: string;
    statusCode: number;
    cause?: unknown | undefined;
    stack?: string | undefined;
  }) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.cause = cause;
    this.stackTrace = stack || this.stack;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    // restore prototype chain
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  public toApiResponse(): ApiResponseType<null> {
    const exposeDetails = process.env.NODE_ENV !== "production";

    return {
      success: false,
      statusCode: this.statusCode,
      message: this.message,
      data: null,
      ...(exposeDetails && this.cause !== undefined
        ? { error: this.cause }
        : {}),
      ...(process.env.NODE_ENV === "development" && this.stackTrace
        ? { stack: this.stackTrace }
        : {}),
    };
  }
}

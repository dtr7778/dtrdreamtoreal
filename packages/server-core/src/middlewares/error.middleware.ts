import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import { MailError, ServiceError } from "@workspace/lib/helpers";

import { apiResponse } from "../helpers";
import { ApiError } from "../helpers/ApiError";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../utils";

export const errorMiddleware: ErrorHandler = (err, c) => {
  const error: ApiError = getServerError(err);

  const errorData = error.toApiResponse();

  return apiResponse(c, {
    ...errorData,
    statusCode: error.statusCode as ContentfulStatusCode,
  });
};

function getServerError(err: unknown): ApiError {
  if (err instanceof ApiError) {
    return err;
  }

  if (err instanceof MailError) {
    return new ApiError({
      statusCode: err.statusCode,
      message: err.message,
      cause: err.cause,
      stack: err.stack,
    });
  }

  if (err instanceof ServiceError) {
    return new ApiError({
      statusCode: err.statusCode,
      message: err.message,
      cause: err.cause,
      stack: err.stack,
    });
  }

  if (err instanceof SyntaxError) {
    return new ApiError({
      statusCode: BAD_REQUEST,
      message: err.message,
      cause: err.cause,
      stack: err.stack,
    });
  }
  if (
    err instanceof TypeError ||
    err instanceof RangeError ||
    err instanceof ReferenceError
  ) {
    return new ApiError({
      statusCode: BAD_REQUEST,
      message: err.message,
      cause: err.cause,
      stack: err.stack,
    });
  }

  return new ApiError({
    statusCode: INTERNAL_SERVER_ERROR,
    message: err instanceof Error ? err.message : "Unknown error",
    cause: err,
    stack: err instanceof Error ? err.stack : undefined,
  });
}

import { StatusCodes } from "http-status-codes";

import { MailError } from "@workspace/lib/utils";

import { ApiError } from "../classes";
import { API_MESSAGE } from "../constant";
import type { INextFunction, IRequest, IResponse } from "../types";
import { sendApiResponse } from "../utils";

export function errorMiddleware(
  err: unknown,
  _req: IRequest,
  res: IResponse,
  next: INextFunction
) {
  // A response may already be streaming (e.g. SSE). Hand the error back to
  // Express' default handler instead of attempting a second response.
  if (res.headersSent) {
    next(err);
    return;
  }

  const error: ApiError = getServerError(err);

  const errorData = error.toApiResponse();

  return sendApiResponse(res)(errorData);
}

/** Whether internal error details may be exposed to the client. */
function shouldExposeErrorDetails(): boolean {
  return process.env.NODE_ENV !== "production";
}

function getServerError(err: unknown): ApiError {
  if (err instanceof ApiError) {
    return err;
  }

  const exposeDetails = shouldExposeErrorDetails();

  if (err instanceof MailError) {
    return new ApiError({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: exposeDetails ? err.message : API_MESSAGE.INTERNAL_SERVER_ERROR,
      cause: exposeDetails ? err.cause : undefined,
      stack: exposeDetails ? err.stack : undefined,
    });
  }
  if (err instanceof SyntaxError) {
    return new ApiError({
      statusCode: StatusCodes.BAD_REQUEST,
      message: exposeDetails
        ? err?.message || "Invalid syntax"
        : "Invalid request body",
      cause: exposeDetails ? err.cause : undefined,
      stack: exposeDetails ? err.stack : undefined,
    });
  }
  if (
    err instanceof TypeError ||
    err instanceof RangeError ||
    err instanceof ReferenceError
  ) {
    return new ApiError({
      statusCode: StatusCodes.BAD_REQUEST,
      message: exposeDetails ? err.message : "Invalid request",
      cause: exposeDetails ? err.cause : undefined,
      stack: exposeDetails ? err.stack : undefined,
    });
  }

  return new ApiError({
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message:
      exposeDetails && err instanceof Error
        ? err.message
        : API_MESSAGE.INTERNAL_SERVER_ERROR,
    cause: exposeDetails ? err : undefined,
    stack: exposeDetails && err instanceof Error ? err.stack : undefined,
  });
}

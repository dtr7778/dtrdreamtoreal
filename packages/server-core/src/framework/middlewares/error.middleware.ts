import { StatusCodes } from "http-status-codes";

import { BullmqError } from "@workspace/lib/bullmq";
import { MailError, ServiceError } from "@workspace/lib/utils";

import { ApiError } from "../classes";
import { API_MESSAGE } from "../constant";
import { captureServerError } from "../sentry";
import type { INextFunction, IRequest, IResponse } from "../types";
import { sendApiResponse } from "../utils";

export function errorMiddleware(
  err: unknown,
  req: IRequest,
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

  if (error.statusCode >= 500) {
    const request = req as IRequest & {
      id?: string;
      method?: string;
      originalUrl?: string;
      user?: { id?: string };
    };

    captureServerError(err, {
      requestId: request.id,
      userId: request.user?.id,
      method: request.method,
      route: request.originalUrl,
    });
  }

  const errorData = error.toApiResponse();

  return sendApiResponse(res)(errorData);
}

function getServerError(err: unknown): ApiError {
  if (err instanceof ApiError) {
    return err;
  }

  if (err instanceof BullmqError) {
    return new ApiError({
      statusCode: err.statusCode,
      message: err.message,
      cause: err.cause,
      stack: err.stack,
    });
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
      statusCode: StatusCodes.BAD_REQUEST,
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
      statusCode: StatusCodes.BAD_REQUEST,
      message: err.message,
      cause: err.cause,
      stack: err.stack,
    });
  }

  return new ApiError({
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message:
      err instanceof Error ? err.message : API_MESSAGE.INTERNAL_SERVER_ERROR,
    cause: err,
    stack: err instanceof Error ? err.stack : undefined,
  });
}

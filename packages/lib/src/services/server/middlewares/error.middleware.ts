import { StatusCodes } from "http-status-codes";

import { MailError } from "../../../utils";
import { ApiError } from "../classes";
import { API_MESSAGE } from "../constant";
import { ICsrfTokenError } from "../createCsrf";
import type { INextFunction, IRequest, IResponse } from "../types";

export function errorMiddleware(CsrfTokenError?: ICsrfTokenError) {
  return function (
    err: unknown,
    req: IRequest,
    res: IResponse,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: INextFunction
  ) {
    const error: ApiError = getServerError(err, CsrfTokenError);

    const errorData = error.toApiResponse();

    return res.status(errorData.statusCode).json(errorData);
  };
}

function getServerError(
  err: unknown,
  CsrfTokenError?: ICsrfTokenError
): ApiError {
  if (err instanceof ApiError) {
    return err;
  }
  if (CsrfTokenError && err === CsrfTokenError) {
    return new ApiError({
      statusCode: StatusCodes.FORBIDDEN,
      message: API_MESSAGE.INVALID_CSRF,
    });
  }
  if (err instanceof MailError) {
    return new ApiError({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: err.message,
      cause: err.cause,
      stack: err.stack,
    });
  }
  if (err instanceof SyntaxError) {
    return new ApiError({
      statusCode: StatusCodes.BAD_REQUEST,
      message: err?.message || "Invalid syntax",
      cause: err.cause,
      stack: err.stack,
    });
  }
  if (err instanceof TypeError) {
    return new ApiError({
      statusCode: StatusCodes.BAD_REQUEST,
      message: err?.message || "Type error occurred",
      cause: err.cause,
      stack: err.stack,
    });
  }
  if (err instanceof RangeError) {
    return new ApiError({
      statusCode: StatusCodes.BAD_REQUEST,
      message: err?.message || "Range error occurred",
      cause: err.cause,
      stack: err.stack,
    });
  }
  if (err instanceof ReferenceError) {
    return new ApiError({
      statusCode: StatusCodes.BAD_REQUEST,
      message: err?.message || "Reference error occurred",
      cause: err.cause,
      stack: err.stack,
    });
  }
  let message: string = API_MESSAGE.INTERNAL_SERVER_ERROR;
  let stack: string | undefined = undefined;
  let errorData: unknown | undefined;

  if (err instanceof Error) {
    message = err.message;
    stack = err.stack;
    errorData = err;
  }

  return new ApiError({
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message,
    cause: errorData,
    stack,
  });
}

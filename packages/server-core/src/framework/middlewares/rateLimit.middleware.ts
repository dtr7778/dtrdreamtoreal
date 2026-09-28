import rateLimit from "express-rate-limit";
import { StatusCodes } from "http-status-codes";

import type { IIoRedisRatelimit } from "@workspace/lib/rate-limit/ioredis";
import { ApiError } from "../classes/ApiError";
import { API_MESSAGE } from "../constant";
import type { INextFunction, IRequest, IResponse } from "../types";

export function rateLimitMiddleware(ratelimit: IIoRedisRatelimit) {
  return rateLimit({
    store: ratelimit.store,
    windowMs: ratelimit.windowMs,
    limit: ratelimit.requests,
    standardHeaders: true,
    legacyHeaders: true,
    handler: (
      _request: IRequest,
      _response: IResponse,
      next: INextFunction
    ) => {
      next(
        new ApiError({
          statusCode: StatusCodes.TOO_MANY_REQUESTS,
          message: API_MESSAGE.RATE_LIMIT,
        })
      );
    },
  });
}

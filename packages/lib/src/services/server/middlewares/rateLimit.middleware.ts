import { StatusCodes } from "http-status-codes";

import type { IRatelimit } from "../../rate-limit";
import { ApiError } from "../classes/ApiError";
import { API_MESSAGE } from "../constant";
import { INextFunction, IRequest, IResponse } from "../types";

export function rateLimitMiddleware(ratelimit: IRatelimit) {
  return async function (req: IRequest, res: IResponse, next: INextFunction) {
    const { success, limit, remaining, reset } = await ratelimit.limit(
      `${req.ip}`
    );

    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", reset);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      res.setHeader("X-RateLimit-Retry-After", retryAfter);

      throw new ApiError({
        message: API_MESSAGE.RATE_LIMIT,
        statusCode: StatusCodes.TOO_MANY_REQUESTS,
      });
    }

    next();
  };
}

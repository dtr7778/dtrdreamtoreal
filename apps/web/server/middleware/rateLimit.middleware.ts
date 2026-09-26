import {
  aiRateLimit,
  protectedRateLimit,
  publicRateLimit,
} from "@/lib/rate-limit";

import { getIp } from "@/utils/getIp";

import { baseOs } from "../orpc.base";

export const publicRateLimitMiddleware = baseOs.middleware(
  async ({ context, next, errors }) => {
    const ip = getIp(context.reqHeaders);

    const { success } = await publicRateLimit.limit(ip);

    if (!success) {
      throw errors.TOO_MANY_REQUESTS();
    }

    return next();
  }
);

export const privateRateLimitMiddleware = baseOs.middleware(
  async ({ context, next, errors }) => {
    const ip = getIp(context.reqHeaders);

    const { success } = await protectedRateLimit.limit(ip);

    if (!success) {
      throw errors.TOO_MANY_REQUESTS();
    }

    return next();
  }
);

export const aiRateLimitMiddleware = baseOs.middleware(
  async ({ context, next, errors }) => {
    const key = context.user?.id ?? getIp(context.reqHeaders);

    const { success } = await aiRateLimit.limit(key);

    if (!success) {
      throw errors.TOO_MANY_REQUESTS();
    }

    return next();
  }
);

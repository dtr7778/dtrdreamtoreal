import {
  type IIoRedisRatelimit,
  type IoRedisGetRemainingResponse,
  IoRedisRatelimit,
  type IoRedisRatelimitConfig,
  type IoRedisRatelimitResponse,
} from "./IoRedisRateLimit.service";

function createRatelimit({
  redisClient,
  requests,
  window,
  prefix = "ratelimit",
}: IoRedisRatelimitConfig): IIoRedisRatelimit {
  return new IoRedisRatelimit({
    redisClient,
    requests,
    window,
    prefix,
  });
}

export {
  createRatelimit,
  type IIoRedisRatelimit,
  type IoRedisGetRemainingResponse,
  type IoRedisRatelimitResponse,
  type IoRedisRatelimitConfig,
};

import { ExtendedRedis } from "../redis/IoRedis.service";
import {
  type IIoRedisRatelimit,
  type IoRedisGetRemainingResponse,
  type IoRedisRatelimitResponse,
  IoRedisRatelimit,
} from "./IoRedisRateLimit.service";
import type { Duration } from "./types";

interface RatelimitFactoryConfig {
  redisClient: ExtendedRedis;
  requests: number;
  window: Duration;
  prefix?: string;
}

function createRatelimit({
  redisClient,
  requests,
  window,
  prefix = "ratelimit",
}: RatelimitFactoryConfig): IIoRedisRatelimit {
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
  type RatelimitFactoryConfig,
};

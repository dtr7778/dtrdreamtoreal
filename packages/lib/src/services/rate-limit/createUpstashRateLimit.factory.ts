import { ExtendedRedis } from "../redis/UpstashRedis.service";
import type { Duration, RatelimitAlgorithm } from "./types";
import {
  type IUpstashRatelimit,
  UpstashRatelimit,
} from "./UpstashRateLimit.service";

export interface RatelimitFactoryConfig {
  redisClient: ExtendedRedis;
  requests: number;
  window: Duration;
  algorithm?: RatelimitAlgorithm;
  prefix?: string;
  analytics?: boolean;
  burst?: number;
}

export function createRatelimit({
  redisClient,
  requests,
  window,
  algorithm = "slidingWindow",
  prefix = "ratelimit",
  analytics = true,
  burst,
}: RatelimitFactoryConfig): IUpstashRatelimit {
  return new UpstashRatelimit({
    redisClient,
    requests,
    window,
    algorithm,
    prefix,
    analytics,
    burst,
  });
}

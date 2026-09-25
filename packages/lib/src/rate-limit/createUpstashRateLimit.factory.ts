import { ExtendedRedis } from "@workspace/redis/client/upstash";

import type { Duration, RatelimitAlgorithm } from "./types";
import {
  type IUpstashRatelimit,
  UpstashRatelimit,
} from "./UpstashRateLimit.service";

interface RatelimitFactoryConfig {
  redisClient: ExtendedRedis;
  requests: number;
  window: Duration;
  algorithm?: RatelimitAlgorithm;
  prefix?: string;
  analytics?: boolean;
  burst?: number;
}

function createRatelimit({
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

export { createRatelimit, type IUpstashRatelimit, type RatelimitFactoryConfig };

import { ExtendedRedis } from "../redis";
import type { Duration, IRatelimit, RatelimitAlgorithm } from "./types";
import { UpstashRatelimit } from "./upstashRateLimit.service";

export type {
  IRatelimit,
  RatelimitResponse,
  Duration,
  RatelimitAlgorithm,
} from "./types";

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
  prefix = "upstash-ratelimit",
  analytics = true,
  burst,
}: RatelimitFactoryConfig): IRatelimit {
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

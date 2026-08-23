import { Ratelimit } from "@upstash/ratelimit";

import type { UpStashRedis } from "../redis";
import type {
  Duration,
  GetRemainingResponse,
  IRatelimit,
  RatelimitAlgorithm,
  RatelimitResponse,
} from "./types";

export interface UpstashRatelimitConfig {
  redisClient: UpStashRedis;
  requests: number;
  window: Duration;
  algorithm: RatelimitAlgorithm;
  prefix?: string;
  analytics?: boolean;
  burst?: number;
}

export class UpstashRatelimit implements IRatelimit {
  private readonly ratelimit: Ratelimit;
  private readonly burst: number;

  constructor(private readonly configs: UpstashRatelimitConfig) {
    this.burst = configs.burst ?? configs.requests;

    const limiterMap = {
      slidingWindow: Ratelimit.slidingWindow(configs.requests, configs.window),
      fixedWindow: Ratelimit.fixedWindow(configs.requests, configs.window),
      tokenBucket: Ratelimit.tokenBucket(
        configs.requests,
        configs.window,
        this.burst
      ),
    };

    this.ratelimit = new Ratelimit({
      redis: configs.redisClient,
      limiter: limiterMap[configs.algorithm],
      analytics: configs.analytics,
      prefix: this.configs.prefix,
    });
  }

  public async limit(identifier: string): Promise<RatelimitResponse> {
    return this.ratelimit.limit(identifier);
  }

  public async getRemaining(identifier: string): Promise<GetRemainingResponse> {
    return this.ratelimit.getRemaining(identifier);
  }
}

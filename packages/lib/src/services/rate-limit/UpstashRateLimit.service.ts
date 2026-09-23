import { Ratelimit } from "@upstash/ratelimit";

import { ExtendedRedis } from "../redis/UpstashRedis.service";
import type { Duration, RatelimitAlgorithm } from "./types";

export type RatelimitResponse = ReturnType<
  InstanceType<typeof Ratelimit>["limit"]
>;
export type GetRemainingResponse = ReturnType<
  InstanceType<typeof Ratelimit>["getRemaining"]
>;

export interface IUpstashRatelimit {
  limit(identifier: string): Promise<RatelimitResponse>;
  getRemaining(identifier: string): Promise<GetRemainingResponse>;
}

export interface UpstashRatelimitConfig {
  redisClient: ExtendedRedis;
  requests: number;
  window: Duration;
  algorithm: RatelimitAlgorithm;
  prefix?: string;
  analytics?: boolean;
  burst?: number;
}

export class UpstashRatelimit implements IUpstashRatelimit {
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

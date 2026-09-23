import { RedisStore } from "rate-limit-redis";

import { ExtendedRedis } from "../redis/IoRedis.service";
import type { Duration, WindowUnit } from "./types";

const WINDOW_UNIT_IN_MS: Record<WindowUnit, number> = {
  ms: 1,
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

function windowToMs(window: Duration): number {
  const [amount, unit] = window.split(" ") as [string, WindowUnit];

  return Number(amount) * WINDOW_UNIT_IN_MS[unit];
}

export interface IIoRedisRatelimit {
  store: RedisStore;
  requests: number;
  windowMs: number;
}

export interface IoRedisRatelimitConfig {
  redisClient: ExtendedRedis;
  requests: number;
  window: Duration;
  prefix?: string;
}

/**
 * Redis-backed fixed window rate limiter built on top of `rate-limit-redis`.
 *
 * Uses the same `IRatelimit` contract as the Upstash implementation so it can
 * be used interchangeably (for example by `rateLimitMiddleware`).
 */
export class IoRedisRatelimit implements IIoRedisRatelimit {
  public readonly store: RedisStore;
  public readonly requests: number;
  public readonly windowMs: number;
  private initPromise: Promise<void> | undefined;

  constructor(config: IoRedisRatelimitConfig) {
    this.requests = config.requests;
    this.windowMs = windowToMs(config.window);

    this.store = new RedisStore({
      prefix: config.prefix,
      sendCommand: (...args: string[]) => {
        const [command, ...rest] = args;

        return config.redisClient.call(
          command as string,
          ...rest
        ) as Promise<never>;
      },
    });
  }
}

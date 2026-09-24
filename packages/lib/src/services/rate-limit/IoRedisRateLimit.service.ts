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

/** Result of a rate-limit check. */
export interface IoRedisRatelimitResponse {
  /** Whether the request is allowed. */
  success: boolean;
  /** Maximum number of requests allowed per window. */
  limit: number;
  /** Requests still available in the current window. */
  remaining: number;
  /** Unix timestamp (ms) at which the current window resets. */
  reset: number;
}

/** Result of a non-consuming remaining-requests lookup. */
export interface IoRedisGetRemainingResponse {
  /** Requests still available in the current window. */
  remaining: number;
  /** Unix timestamp (ms) at which the current window resets. */
  reset: number;
}

export interface IIoRedisRatelimit {
  store: RedisStore;
  requests: number;
  windowMs: number;
  /** Consume one request for `identifier` and report the outcome. */
  limit(identifier: string): Promise<IoRedisRatelimitResponse>;
  /** Report the remaining requests for `identifier` without consuming one. */
  getRemaining(
    identifier: string
  ): Promise<IoRedisGetRemainingResponse>;
}

export interface IoRedisRatelimitConfig {
  redisClient: ExtendedRedis;
  requests: number;
  window: Duration;
  prefix?: string;
}

/**
 * Fixed-window rate limiter backed by ioredis.
 *
 * Counts requests per `identifier` in per-window Redis keys, so the same client
 * drives both `express-rate-limit` (through {@link store}) and manual checks
 * via {@link limit} / {@link getRemaining}.
 */
export class IoRedisRatelimit implements IIoRedisRatelimit {
  public readonly store: RedisStore;
  public readonly requests: number;
  public readonly windowMs: number;

  private readonly redis: ExtendedRedis;
  private readonly prefix: string;

  constructor(config: IoRedisRatelimitConfig) {
    this.requests = config.requests;
    this.windowMs = windowToMs(config.window);
    this.redis = config.redisClient;
    this.prefix = config.prefix ?? "ratelimit";

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

  /** Redis key + reset timestamp for the window `identifier` falls into. */
  private windowKey(identifier: string): { key: string; reset: number } {
    const bucket = Math.floor(Date.now() / this.windowMs);

    return {
      key: `${this.prefix}:${identifier}:${bucket}`,
      reset: (bucket + 1) * this.windowMs,
    };
  }

  public async limit(identifier: string): Promise<IoRedisRatelimitResponse> {
    const { key, reset } = this.windowKey(identifier);

    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.pexpire(key, this.windowMs);
    }

    return {
      success: count <= this.requests,
      limit: this.requests,
      remaining: Math.max(0, this.requests - count),
      reset,
    };
  }

  public async getRemaining(
    identifier: string
  ): Promise<IoRedisGetRemainingResponse> {
    const { key, reset } = this.windowKey(identifier);

    const raw = await this.redis.get(key);
    const count = raw ? Number(raw) : 0;

    return {
      remaining: Math.max(0, this.requests - count),
      reset,
    };
  }
}
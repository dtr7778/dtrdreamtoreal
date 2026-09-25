import { createHash } from "node:crypto";

import { inject } from "inversify";

import {
  createRatelimit,
  IIoRedisRatelimit,
} from "@workspace/lib/rate-limit/ioredis";
import type { ExtendedRedis } from "@workspace/redis/client/ioRedis";

import { httpClient } from "@/lib/http-client";

import { CONTAINER_TYPES } from "@/container/container-types";

export interface GoogleApiRequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  headers?: Record<string, string>;
  /** Cache time-to-live in seconds; pass 0 to skip reading/writing the cache. */
  ttlSeconds?: number;
}

const DEFAULT_TTL_SECONDS = 24 * 60 * 60;

function cacheKey(scope: string, url: string, body: unknown): string {
  const hash = createHash("sha256")
    .update(`${scope}:${url}:${JSON.stringify(body ?? null)}`)
    .digest("hex")
    .slice(0, 40);
  return `gapi:${scope}:${hash}`;
}

export class GoogleApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "GoogleApiError";
  }
}

/**
 * Thin HTTP wrapper for Google APIs that caches responses in Redis and
 * rate-limits outbound calls so a large audit cannot burn the API quota.
 */
export class GoogleApiCache {
  private readonly rateLimiter: IIoRedisRatelimit;
  private readonly ttlSeconds: number = DEFAULT_TTL_SECONDS;
  private readonly identifier: string = "google-apis";

  constructor(
    @inject(CONTAINER_TYPES.Redis) private readonly redis: ExtendedRedis
  ) {
    this.rateLimiter = createRatelimit({
      redisClient: redis,
      requests: 60,
      window: "1 m",
      prefix: "google-api",
    });
  }

  async cachedJson<T>(
    scope: string,
    url: string,
    options: GoogleApiRequestOptions = {}
  ): Promise<T> {
    const ttl = options.ttlSeconds ?? this.ttlSeconds;
    const key = cacheKey(scope, url, options.body);

    if (ttl > 0) {
      const cached = await this.redis.get(key);
      if (cached !== null && cached !== undefined) {
        try {
          return JSON.parse(cached) as T;
        } catch {
          // Stored value is not JSON (e.g. legacy entry); refetch below.
        }
      }
    }

    const rate = await this.rateLimiter.limit(this.identifier);
    if (!rate.success) {
      throw new GoogleApiError("Google API rate limit exceeded", 429, {
        reset: rate.reset,
        remaining: rate.remaining,
      });
    }

    const response = await httpClient.request<string>({
      url,
      method: options.method ?? "GET",
      headers: {
        accept: "application/json",
        ...(options.body ? { "content-type": "application/json" } : {}),
        ...options.headers,
      },
      data: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (response.status < 200 || response.status >= 300) {
      let details: unknown;
      try {
        details = response.data ? JSON.parse(response.data) : null;
      } catch {
        details = response.data || null;
      }
      throw new GoogleApiError(
        `Google API request failed with status ${response.status}`,
        response.status,
        details
      );
    }

    const data = JSON.parse(response.data) as T;

    if (ttl > 0) {
      await this.redis.setex(
        key,
        Math.max(1, Math.floor(ttl)),
        JSON.stringify(data)
      );
    }

    return data;
  }
}

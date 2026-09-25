import { type CacheConfig } from "drizzle-orm/cache/core/types";
import { upstashCache } from "drizzle-orm/cache/upstash";

import type { DatabaseType } from "../types";
import { createDrizzleClientBase } from "./drizzle-client.base";

interface DrizzleClientConfigs {
  databaseUrl: string;
  isProd: boolean;
  operationMode: "seed" | "normal";
  redisUrl?: string;
  redisToken?: string;
  /** Default cache config applied to every cached query. @default { ex: 60 } */
  redisCacheConfig?: CacheConfig;
  /** Cache every query globally. @default true */
  redisCacheGlobal?: boolean;
  showDBLog?: boolean;
}

export function createDrizzleClient({
  databaseUrl,
  isProd,
  operationMode,
  showDBLog = false,
  redisUrl,
  redisToken,
  redisCacheConfig = { ex: 60 },
  redisCacheGlobal = true,
}: DrizzleClientConfigs): DatabaseType {
  return createDrizzleClientBase({
    databaseUrl,
    isProd,
    operationMode,
    showDBLog,
    cache:
      redisUrl && redisToken
        ? upstashCache({
            url: redisUrl,
            token: redisToken,
            global: redisCacheGlobal,
            config: redisCacheConfig,
          })
        : undefined,
  });
}

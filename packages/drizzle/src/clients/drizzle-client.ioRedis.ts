import { type CacheConfig } from "drizzle-orm/cache/core/types";

import { IoredisCache, type RedisType } from "../IoRedisCache";
import type { DatabaseType } from "../types";
import { createDrizzleClientBase } from "./drizzle-client.base";

interface DrizzleClientConfigs {
  databaseUrl: string;
  isProd: boolean;
  operationMode: "seed" | "normal";
  redis?: RedisType;
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
  redis,
  redisCacheConfig = { ex: 60 },
  redisCacheGlobal = true,
}: DrizzleClientConfigs): DatabaseType {
  return createDrizzleClientBase({
    databaseUrl,
    isProd,
    operationMode,
    showDBLog,
    cache: redis
      ? new IoredisCache(redis, redisCacheConfig, redisCacheGlobal)
      : undefined,
  });
}

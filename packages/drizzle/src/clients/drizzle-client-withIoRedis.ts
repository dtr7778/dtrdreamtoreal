import { type CacheConfig } from "drizzle-orm/cache/core/types";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { IoredisCache, type RedisType } from "../IoRedisCache";
import * as schema from "../schemas";
import { createConnection } from "./createConnection";

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

export type DatabaseType = PostgresJsDatabase<typeof schema>;

export function createDrizzleClient({
  databaseUrl,
  isProd,
  operationMode,
  showDBLog = false,
  redis,
  redisCacheConfig = { ex: 60 },
  redisCacheGlobal = true,
}: DrizzleClientConfigs): DatabaseType {
  const connection = createConnection(databaseUrl, isProd, operationMode);

  let cache: IoredisCache | undefined = undefined;

  if (redis && operationMode !== "seed") {
    cache = new IoredisCache(redis, redisCacheConfig, redisCacheGlobal);
  }

  return drizzle(connection, {
    schema,
    logger: showDBLog,
    cache,
  });
}

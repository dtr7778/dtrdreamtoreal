import { type Cache } from "drizzle-orm/cache/core";
import { type CacheConfig } from "drizzle-orm/cache/core/types";
import { upstashCache } from "drizzle-orm/cache/upstash";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as schema from "../schemas";
import { createConnection } from "./createConnection";

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

export type DatabaseType = PostgresJsDatabase<typeof schema>;

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
  const connection = createConnection(databaseUrl, isProd, operationMode);

  let cache: Cache | undefined = undefined;

  if (redisUrl && redisToken && operationMode !== "seed") {
    cache = upstashCache({
      url: redisUrl,
      token: redisToken,
      global: redisCacheGlobal,
      config: redisCacheConfig,
    });
  }

  return drizzle(connection, {
    schema,
    logger: showDBLog,
    cache,
  });
}

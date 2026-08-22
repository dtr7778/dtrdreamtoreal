import { type Cache } from "drizzle-orm/cache/core";
import { upstashCache } from "drizzle-orm/cache/upstash";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schemas";

interface CreateDrizzleClientConfigs {
  databaseUrl: string;
  isProd: boolean;
  operationMode: "seed" | "normal";
  redisUrl?: string;
  redisToken?: string;
  showDBLog?: boolean;
}

export function createDrizzleClient({
  databaseUrl,
  isProd,
  operationMode,
  showDBLog = false,
  redisUrl,
  redisToken,
}: CreateDrizzleClientConfigs): PostgresJsDatabase<typeof schema> {
  const connection = postgres(databaseUrl, {
    max: isProd ? 20 : 5,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    debug: !isProd && operationMode !== "seed",
  });

  let cache: Cache | undefined = undefined;

  if (redisUrl && redisToken && operationMode !== "seed") {
    cache = upstashCache({
      url: redisUrl,
      token: redisToken,
      global: true,
      config: { ex: 60 },
    });
  }

  return drizzle(connection, {
    schema,
    logger: showDBLog,
    cache,
  });
}

export type DatabaseType = ReturnType<typeof createDrizzleClient>;

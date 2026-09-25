import { type Cache } from "drizzle-orm/cache/core";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "../schemas";
import type { DatabaseType } from "../types";

interface DrizzleClientConfigs {
  databaseUrl: string;
  isProd: boolean;
  operationMode: "seed" | "normal";
  showDBLog?: boolean;
  cache?: Cache;
}

export function createDrizzleClientBase({
  databaseUrl,
  isProd,
  operationMode,
  showDBLog = false,
  cache,
}: DrizzleClientConfigs): DatabaseType {
  const connection = postgres(databaseUrl, {
    max: isProd ? 20 : 5,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    debug: !isProd && operationMode !== "seed",
  });

  return drizzle(connection, {
    schema,
    logger: showDBLog,
    cache: cache && operationMode !== "seed" ? cache : undefined,
  });
}

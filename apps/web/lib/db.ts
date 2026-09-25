import "server-only";

import { createDrizzleClient } from "@workspace/drizzle/client/upstash";
import type { DatabaseType } from "@workspace/drizzle/types";

import { env } from "./env";

const globalForDb = globalThis as unknown as {
  db: DatabaseType | undefined;
};

export const db: DatabaseType =
  globalForDb.db ??
  createDrizzleClient({
    databaseUrl: env.DATABASE_URL,
    isProd: env.NODE_ENV === "production",
    operationMode: "normal",
    redisUrl: env.REDIS_REST_URL,
    redisToken: env.REDIS_REST_TOKEN,
  });

if (env.NODE_ENV !== "production") {
  globalForDb.db = db;
}

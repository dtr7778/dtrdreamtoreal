import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as schema from "../schemas";
import { createConnection } from "./createConnection";

interface DrizzleClientConfigs {
  databaseUrl: string;
  isProd: boolean;
  operationMode: "seed" | "normal";
  showDBLog?: boolean;
}

export type DatabaseType = PostgresJsDatabase<typeof schema>;

export function createDrizzleClient({
  databaseUrl,
  isProd,
  operationMode,
  showDBLog = false,
}: DrizzleClientConfigs): DatabaseType {
  const connection = createConnection(databaseUrl, isProd, operationMode);

  return drizzle(connection, {
    schema,
    logger: showDBLog,
  });
}

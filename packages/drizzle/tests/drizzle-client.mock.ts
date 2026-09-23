import { join } from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { drizzle, type PgliteDatabase } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

import * as schema from "../src/schemas";

export type MockDatabaseType = PgliteDatabase<typeof schema> & {
  $client: PGlite;
};

export async function createMockDrizzleClient(): Promise<MockDatabaseType> {
  const client = new PGlite();

  const db = drizzle(client, { schema });

  await migrate(db, {
    migrationsFolder: join(process.cwd(), "../../supabase/migrations"),
  });

  return db;
}

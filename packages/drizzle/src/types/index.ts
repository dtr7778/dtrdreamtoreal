import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as schema from "../schemas";

export type DatabaseType = PostgresJsDatabase<typeof schema>;

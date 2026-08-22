import { join } from "node:path";

import { config } from "dotenv";

import { createDrizzleClient } from "../drizzle-client";

config({
  path: [join(process.cwd(), "../../.env")],
});

export const db = createDrizzleClient({
  databaseUrl: process.env.DATABASE_URL!,
  isProd: false,
  operationMode: "seed",
});

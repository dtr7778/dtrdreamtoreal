import { join } from "node:path";

import { config } from "dotenv";

import { createDrizzleClientBase } from "../clients/drizzle-client.base";

config({
  path: [join(process.cwd(), "../../.env")],
});

export const db = createDrizzleClientBase({
  databaseUrl: process.env.DATABASE_URL!,
  isProd: false,
  operationMode: "seed",
});

import { join } from "node:path";

import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({
  path: [join(process.cwd(), "../../.env")],
});

export default defineConfig({
  dialect: "postgresql",
  out: "../../supabase/migrations",
  schema: "./src/schemas/**",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  entities: {
    roles: {
      provider: "supabase",
    },
  },
  strict: true,
});

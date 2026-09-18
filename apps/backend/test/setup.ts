import "reflect-metadata";

import { join } from "node:path";

import { config } from "dotenv";
import { afterAll, vi } from "vitest";

config({
  path: [join(process.cwd(), ".env")],
});

afterAll(async () => {
  vi.clearAllMocks();
});

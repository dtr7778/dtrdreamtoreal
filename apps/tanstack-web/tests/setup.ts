import { afterAll, vi } from "vitest";

import { createMockDrizzleClient } from "@workspace/drizzle/client/mock";

vi.mock("#/lib/db", () => {
  const db = createMockDrizzleClient();
  return { getDB: () => db };
});

afterAll(() => {
  vi.clearAllMocks();
});

import { afterAll, afterEach, vi } from "vitest";

import {
  createMockDrizzleClient,
  MockDatabaseType,
} from "@workspace/drizzle/client/mock";
import { createMockRateLimit } from "@workspace/lib/rate-limit/upstash/mock";
import { createMockSupabaseClient } from "@workspace/lib/supabase/client/mock";
import { createMockRedisClient } from "@workspace/redis/client/upstash/mock";

let db: MockDatabaseType;

vi.mock("@/lib/db", async () => {
  db = await createMockDrizzleClient();
  return { db };
});

const redisClient = createMockRedisClient();

vi.mock("@/lib/redis-client", () => {
  return { redisClient: redisClient.Redis };
});

const protectedRateLimit = createMockRateLimit();
const publicRateLimit = createMockRateLimit();

vi.mock("@/lib/rate-limit", () => ({
  protectedRateLimit,
  publicRateLimit,
}));

vi.mock("@/lib/better-auth/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      updateUser: vi.fn(),
    },
  },
}));

vi.mock("@/features/auth/data/getUserPermission", () => ({
  getUserRolesAndPermission: vi.fn(),
}));

vi.mock("@/lib/supabase/server-client", () => ({
  supabaseServerClient: vi.fn(createMockSupabaseClient),
}));

vi.mock("@/lib/supabase/browser-client", () => ({
  supabaseBrowserClient: vi.fn(createMockSupabaseClient),
}));

afterEach(() => {
  redisClient.store.clear();
  protectedRateLimit.store.clear();
  publicRateLimit.store.clear();
});

afterAll(() => {
  vi.clearAllMocks();
  db.$client.close();
});

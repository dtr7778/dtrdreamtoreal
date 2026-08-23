import { vi } from "vitest";

export function createMockRateLimit() {
  const store = new Map<string, { count: number; reset: number }>();

  return {
    store,
    limit: vi.fn(async (identifier: string) => {
      const now = Date.now();
      const entry = store.get(identifier);

      // reset window if expired
      if (!entry || now > entry.reset) {
        store.set(identifier, {
          count: 1,
          reset: now + 10_000,
        });
        return {
          success: true,
          limit: 10,
          remaining: 9,
          reset: now + 10_000,
        };
      }

      entry.count++;
      const remaining = Math.max(0, 10 - entry.count);
      const success = entry.count <= 10;

      return { success, limit: 10, remaining, reset: entry.reset };
    }),
  };
}

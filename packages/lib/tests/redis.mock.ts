import { vi } from "vitest";

const store = new Map<string, unknown>();

export function createMockRedisClient() {
  return {
    store,
    Redis: vi.fn().mockImplementation(() => ({
      get: vi.fn(async (key: string) => store.get(key) ?? null),
      set: vi.fn(async (key: string, value: unknown) => {
        store.set(key, value);
        return "OK";
      }),
      del: vi.fn(async (...keys: string[]) => {
        keys.forEach((k) => store.delete(k));
        return keys.length;
      }),
      exists: vi.fn(
        async (...keys: string[]) => keys.filter((k) => store.has(k)).length
      ),
      expire: vi.fn(async () => 1),
      ttl: vi.fn(async () => -1),
      incr: vi.fn(async (key: string) => {
        const val = Number(store.get(key) ?? 0) + 1;
        store.set(key, val);
        return val;
      }),
      hget: vi.fn(async (key: string, field: string) => {
        const hash = store.get(key) as Record<string, unknown> | undefined;
        return hash?.[field] ?? null;
      }),
      hset: vi.fn(async (key: string, fields: Record<string, unknown>) => {
        const existing = (store.get(key) as Record<string, unknown>) ?? {};
        store.set(key, { ...existing, ...fields });
        return Object.keys(fields).length;
      }),
      hgetall: vi.fn(async (key: string) => store.get(key) ?? null),
      hdel: vi.fn(async (key: string, ...fields: string[]) => {
        const hash = store.get(key) as Record<string, unknown> | undefined;
        if (!hash) return 0;
        fields.forEach((f) => delete hash[f]);
        store.set(key, hash);
        return fields.length;
      }),
      keys: vi.fn(async (pattern: string) => {
        // basic wildcard support
        const regex = new RegExp("^" + pattern.replace("*", ".*") + "$");
        return [...store.keys()].filter((k) => regex.test(k));
      }),
      flushall: vi.fn(async () => {
        store.clear();
        return "OK";
      }),
    })),
  };
}

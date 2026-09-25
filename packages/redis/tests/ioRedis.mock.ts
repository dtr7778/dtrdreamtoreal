import Redis from "ioredis-mock";

import type { ExtendedRedis } from "../src/clients/redis-client.ioRedis";

export function createMockRedisClient(): ExtendedRedis {
  return new Redis();
}

import Redis from "ioredis-mock";

import type { ExtendedRedis } from "../../src/services/redis/createIoRedisClient.factory";

export function createMockRedisClient(): ExtendedRedis {
  return new Redis();
}

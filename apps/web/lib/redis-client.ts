import { createRedisClient, ExtendedRedis } from "@workspace/lib/redis";

import { env } from "./env";

const globalForRedis = globalThis as unknown as {
  redisClient?: ExtendedRedis;
};

export const redisClient: ExtendedRedis =
  globalForRedis.redisClient ??
  createRedisClient({
    url: env.REDIS_REST_URL,
    token: env.REDIS_REST_TOKEN,
  }).getClient();

if (env.NODE_ENV !== "production") {
  globalForRedis.redisClient = redisClient;
}

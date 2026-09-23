import {
  type ExtendedRedis,
  UpstashRedisService,
  type UpstashRedisServiceConfig,
} from "./UpstashRedis.service";

function createRedisClient(config: UpstashRedisServiceConfig): ExtendedRedis {
  const upstashRedis = new UpstashRedisService(config);

  return upstashRedis.getClient();
}

export { createRedisClient, type ExtendedRedis };

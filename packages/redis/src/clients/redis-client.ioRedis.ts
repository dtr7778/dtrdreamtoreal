import {
  type ExtendedRedis,
  IoRedisService,
  type IoRedisServiceConfig,
  resolveRedisTls,
} from "../IoRedis.service";

function createRedisClient(config: IoRedisServiceConfig): ExtendedRedis {
  const ioRedis = new IoRedisService(config);

  return ioRedis.getClient();
}

export { createRedisClient, resolveRedisTls, type ExtendedRedis };

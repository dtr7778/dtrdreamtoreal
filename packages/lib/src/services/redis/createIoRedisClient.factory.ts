import {
  type ExtendedRedis,
  IoRedisService,
  type IoRedisServiceConfig,
} from "./IoRedis.service";

function createRedisClient(config: IoRedisServiceConfig): ExtendedRedis {
  const ioRedis = new IoRedisService(config);

  return ioRedis.getClient();
}

export { createRedisClient, type ExtendedRedis };

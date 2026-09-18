import { ExtendedRedis } from "./types";
import {
  UpstashRedisService,
  UpstashRedisServiceConfig,
} from "./UpstashRedis.service";

export function createRedisClient({
  url,
  token,
}: UpstashRedisServiceConfig): ExtendedRedis {
  const upstashRedis = new UpstashRedisService({
    url,
    token,
  });

  return upstashRedis.getClient();
}

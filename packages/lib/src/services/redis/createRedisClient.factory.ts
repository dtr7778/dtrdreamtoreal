import { IBaseRedisClientService } from "./types";
import {
  IUpstashRedisServiceConfig,
  UpstashRedisService,
} from "./UpstashRedis.service";

export function createRedisClient({
  url,
  token,
}: IUpstashRedisServiceConfig): IBaseRedisClientService {
  const upstashRedis = new UpstashRedisService({
    url,
    token,
  });
  upstashRedis.init();
  return upstashRedis;
}

import { Redis as UpStashRedis } from "@upstash/redis";

export type { UpStashRedis };

export type ExtendedRedis = UpStashRedis;

export interface IBaseRedisClientService {
  getClient(): ExtendedRedis;
}

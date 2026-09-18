import { Redis } from "@upstash/redis";

import { ExtendedRedis } from "./types";

export interface IUpstashRedistService {
  getClient(): ExtendedRedis;
}

export interface UpstashRedisServiceConfig {
  url: string;
  token: string;
}

export class UpstashRedisService implements IUpstashRedistService {
  protected client: ExtendedRedis | undefined = undefined;

  constructor(config: UpstashRedisServiceConfig) {
    this.client = new Redis({
      url: config.url,
      token: config.token,
    });
  }

  public getClient(): ExtendedRedis {
    if (!this.client) {
      throw new Error("Redis client not initialized");
    }
    return this.client;
  }
}

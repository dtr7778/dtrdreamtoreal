import { Redis } from "@upstash/redis";

import { BaseRedisService } from "./BaseRedis.service";

export interface IUpstashRedisServiceConfig {
  url: string;
  token: string;
}

export class UpstashRedisService extends BaseRedisService {
  constructor(private readonly configs: IUpstashRedisServiceConfig) {
    super();
  }

  async init(): Promise<void> {
    this.client = new Redis({
      url: this.configs.url,
      token: this.configs.token,
    });
  }
}

import Redis from "ioredis";

export type ExtendedRedis = Redis;

export interface IIoRedisService {
  getClient(): ExtendedRedis;
}

export interface IoRedisServiceConfig {
  username: string;
  password: string;
  port: number;
  host: string;
}

export class IoRedisService implements IIoRedisService {
  protected client: ExtendedRedis | undefined = undefined;

  constructor(config: IoRedisServiceConfig) {
    this.client = new Redis({
      port: config.port,
      host: config.host,
      username: config.username,
      password: config.password,
    });
  }

  public getClient(): ExtendedRedis {
    if (!this.client) {
      throw new Error("Redis client not initialized");
    }
    return this.client;
  }
}

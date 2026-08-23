import type { ExtendedRedis, IBaseRedisClientService } from "./types";

export abstract class BaseRedisService implements IBaseRedisClientService {
  protected client: ExtendedRedis | undefined = undefined;

  constructor() {}

  protected abstract init(): Promise<void>;

  public getClient(): ExtendedRedis {
    if (!this.client) {
      throw new Error("Redis client not initialized");
    }
    return this.client;
  }
}

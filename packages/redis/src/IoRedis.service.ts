import Redis from "ioredis";

export type ExtendedRedis = Redis;

export interface IIoRedisService {
  getClient(): ExtendedRedis;
}

export interface IoRedisServiceConfig {
  url: string;
  tls?: boolean | object;
  db?: number;
}

export function resolveRedisTls(url: string, override?: boolean): boolean {
  if (typeof override === "boolean") return override;
  return url.startsWith("rediss://");
}

export class IoRedisService implements IIoRedisService {
  protected client: ExtendedRedis | undefined = undefined;

  constructor(config: IoRedisServiceConfig) {
    this.client = new Redis(config.url, {
      db: config.db,
      ...(config.tls ? { tls: config.tls === true ? {} : config.tls } : {}),
      retryStrategy: (times) => Math.min(times * 200, 5000),
      enableReadyCheck: true,
      lazyConnect: false,
    });

    this.client.on("error", (err) => {
      console.error("[ioredis] connection error:", err.message);
    });

    this.client.on("connect", () => {
      console.log("[ioredis] connected");
    });
  }

  public getClient(): ExtendedRedis {
    if (!this.client) {
      throw new Error("Redis client not initialized");
    }
    return this.client;
  }
}

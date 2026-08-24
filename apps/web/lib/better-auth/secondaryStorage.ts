import { SecondaryStorage } from "better-auth";

import { redisClient } from "../redis-client";

export const redisSecondaryStorage: SecondaryStorage = {
  async get(key: string) {
    const value = await redisClient.get(key);

    if (value === null || value === undefined) {
      return;
    }

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  },

  async set(key: string, value: string, ttl?: number) {
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);

    if (ttl) {
      await redisClient.set(key, stringValue, { ex: ttl });
    } else {
      await redisClient.set(key, stringValue);
    }
  },

  async delete(key: string) {
    await redisClient.del(key);
  },

  async getAndDelete(key: string) {
    const value = await redisClient.getdel(key);

    if (value === null || value === undefined) {
      return;
    }

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  },

  async increment(key: string, ttl?: number) {
    const newValue = await redisClient.incr(key);

    if (ttl && newValue === 1) {
      await redisClient.expire(key, ttl);
    }

    return newValue;
  },
};

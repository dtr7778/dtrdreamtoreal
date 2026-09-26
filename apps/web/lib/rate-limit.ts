import { createRatelimit } from "@workspace/lib/rate-limit/upstash";

import { redisClient } from "./redis-client";

export const protectedRateLimit = createRatelimit({
  redisClient: redisClient,
  requests: 100,
  window: "1 m",
  algorithm: "slidingWindow",
});

export const publicRateLimit = createRatelimit({
  redisClient: redisClient,
  requests: 5,
  window: "1 h",
  algorithm: "fixedWindow",
});

export const aiRateLimit = createRatelimit({
  redisClient: redisClient,
  requests: 20,
  window: "1 h",
  algorithm: "slidingWindow",
  prefix: "ratelimit:ai",
});

export const qstashMinRateLimit = createRatelimit({
  redisClient: redisClient,
  requests: 100,
  window: "1 m",
  algorithm: "slidingWindow",
  prefix: "ratelimit:qstash:min",
});

export const qstashHourlyRateLimit = createRatelimit({
  redisClient: redisClient,
  requests: 1000,
  window: "1 h",
  algorithm: "slidingWindow",
  prefix: "ratelimit:qstash:hr",
});

export const bullmqMinRateLimit = createRatelimit({
  redisClient: redisClient,
  requests: 100,
  window: "1 m",
  algorithm: "slidingWindow",
  prefix: "ratelimit:bullmq:min",
});

export const bullmqHourlyRateLimit = createRatelimit({
  redisClient: redisClient,
  requests: 1000,
  window: "1 h",
  algorithm: "slidingWindow",
  prefix: "ratelimit:bullmq:hr",
});

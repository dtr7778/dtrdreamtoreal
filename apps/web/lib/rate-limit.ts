import { createRatelimit } from "@workspace/lib/rate-limit";

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

export const qstashMinRateLimit = createRatelimit({
  redisClient: redisClient,
  requests: 100,
  window: "1 m",
  algorithm: "slidingWindow",
  prefix: "mail:ratelimit:min",
});

export const qstashHourlyRateLimit = createRatelimit({
  redisClient: redisClient,
  requests: 1000,
  window: "1 h",
  algorithm: "slidingWindow",
  prefix: "mail:ratelimit:hr",
});

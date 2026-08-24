import { createQstashClient, IQstashService } from "@workspace/lib/qstash";

import { env } from "../env";
import { redisClient } from "../redis-client";

const globalForQstash = globalThis as unknown as {
  qstashClient?: IQstashService;
};

export const qstashClient =
  globalForQstash.qstashClient ??
  createQstashClient({
    baseUrl: env.QSTASH_URL,
    token: env.QSTASH_TOKEN,
    currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY,
    redisClient,
  });

if (env.NODE_ENV !== "production") {
  globalForQstash.qstashClient = qstashClient;
}

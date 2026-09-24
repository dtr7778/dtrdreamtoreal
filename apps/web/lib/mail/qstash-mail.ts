import { createQstashMailer, IQstashMailerService } from "@workspace/mail";

import { db } from "../db";
import { env } from "../env";
import { qstashHourlyRateLimit, qstashMinRateLimit } from "../rate-limit";
import { redisClient } from "../redis-client";

const globalForMail = globalThis as unknown as {
  qstashMail?: IQstashMailerService;
};

export const qstashMail =
  globalForMail.qstashMail ??
  createQstashMailer({
    appName: env.NEXT_PUBLIC_SITE_NAME,
    database: db,
    redisClient,
    supportMail: env.SUPPORT_MAIL,
    systemMail: env.SYSTEM_MAIL,
    resendApiKey: env.RESEND_API_KEY,
    minRatelimit: qstashMinRateLimit,
    hourRatelimit: qstashHourlyRateLimit,
    callbackUrl: `${env.NEXT_PUBLIC_SITE_URL}/api/qstash/mail/callback`,
    receiptCallbackUrl: `${env.NEXT_PUBLIC_SITE_URL}/api/qstash/mail/receipt`,
    failureCallbackUrl: `${env.NEXT_PUBLIC_SITE_URL}/api/qstash/mail/failed`,
    defaultRetries: 3,
    baseUrl: env.QSTASH_URL,
    token: env.QSTASH_TOKEN,
    currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY,
    dedupWindowSeconds: 300,
  });

if (env.NODE_ENV !== "production") {
  globalForMail.qstashMail = qstashMail;
}

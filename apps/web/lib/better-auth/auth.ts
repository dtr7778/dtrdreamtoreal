import { nextCookies } from "better-auth/next-js";

import { createBullmqBetterAuth } from "@workspace/auth";
import { createSecondaryStorage } from "@workspace/auth/upstash-secondary-storage";

import { ERROR_PAGE_PATH } from "@/constants";

import { db } from "../db";
import { env } from "../env";
import { bullmqMail } from "../mail/bullmq-mail";
import { redisClient } from "../redis-client";

export const auth = createBullmqBetterAuth({
  domainName: env.DOMAIN_NAME,
  port: 3000,
  secret: env.BETTER_AUTH_SECRET,
  appName: env.NEXT_PUBLIC_SITE_NAME,
  isDev: env.NODE_ENV !== "production",
  errorPagePath: ERROR_PAGE_PATH,
  database: db,
  secondaryStorage: createSecondaryStorage(redisClient),
  mailer: bullmqMail,
  google: {
    clientId: env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID,
    clientSecret: env.GOOGLE_AUTH_CLIENT_SECRET,
    redirectURI: `${env.NEXT_PUBLIC_SITE_URL}/api/auth/callback/google`,
  },
  plugins: [nextCookies()],
});

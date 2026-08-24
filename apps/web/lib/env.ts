import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const env = createEnv({
  // Only validate in server and test environments
  isServer: typeof window === "undefined" || process.env.NODE_ENV === "test",
  // Skip validation in test to avoid the error
  skipValidation:
    process.env.NODE_ENV === "test" ||
    process.env.SKIP_ENV_VALIDATION === "true"
      ? true
      : undefined,
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    DATABASE_URL: z.string().min(1),
    REDIS_REST_URL: z.url().min(1),
    REDIS_REST_TOKEN: z.string().min(1),
    QSTASH_URL: z.url().min(1),
    QSTASH_TOKEN: z.string().min(1),
    QSTASH_CURRENT_SIGNING_KEY: z.string().min(1),
    QSTASH_NEXT_SIGNING_KEY: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    SUPPORT_MAIL: z.email().min(1),
    MAIL_FROM: z.email().min(1),
  },
  client: {
    NEXT_PUBLIC_NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    NEXT_PUBLIC_SITE_URL: z.url().min(1),
    NEXT_PUBLIC_SITE_NAME: z.string().min(1),
  },
  runtimeEnv:
    process.env.NODE_ENV === "test" ||
    process.env.SKIP_ENV_VALIDATION === "true"
      ? {
          NODE_ENV: "production",
          NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
          NEXT_PUBLIC_NODE_ENV: "production",
          NEXT_PUBLIC_SITE_NAME: "My App",
          DATABASE_URL:
            "postgresql://postgres:postgres@localhost:5432/postgres",
          REDIS_REST_URL: "http://localhost:6379",
          REDIS_REST_TOKEN: "token",
          QSTASH_URL: "http://localhost:8080",
          QSTASH_TOKEN: "token",
          QSTASH_CURRENT_SIGNING_KEY: "current_signing_key",
          QSTASH_NEXT_SIGNING_KEY: "next_signing_key",
          RESEND_API_KEY: "resend_api_key",
          SUPPORT_MAIL: "support@example.com",
          MAIL_FROM: "test@example.com",
        }
      : {
          NODE_ENV: process.env.NODE_ENV,
          NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
          NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
          NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
          DATABASE_URL: process.env.DATABASE_URL,
          REDIS_REST_URL: process.env.REDIS_REST_URL,
          REDIS_REST_TOKEN: process.env.REDIS_REST_TOKEN,
          QSTASH_URL: process.env.QSTASH_URL,
          QSTASH_TOKEN: process.env.QSTASH_TOKEN,
          QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY,
          QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY,
          RESEND_API_KEY: process.env.RESEND_API_KEY,
          SUPPORT_MAIL: process.env.SUPPORT_MAIL,
          MAIL_FROM: process.env.MAIL_FROM,
        },
});

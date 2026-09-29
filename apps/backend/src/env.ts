import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const env = createEnv({
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
    PORT: z
      .string()
      .default("8000")
      .transform((arg) => parseInt(arg)),
    CSRF_TOKEN: z.string().min(1),
    BULLMQ_SIGNING_SECRET: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    API_LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace"])
      .default("info"),
    REDIS_URL: z.string().min(1),
    REDIS_TLS: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
    CORS_ORIGIN: z
      .string()
      .min(1)
      .transform((value) =>
        value
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean)
      ),
    RESEND_INBOUND_WEBHOOK_SECRET: z.string().min(1),
    RESEND_OUTBOUND_WEBHOOK_SECRET: z.string().min(1),
    RESEND_EVENT_WEBHOOK_SECRET: z.string().min(1),
    APP_NAME: z.string().min(1),
    SITE_URL: z.url(),
    DOMAIN_NAME: z.string().optional(),
    SUPPORT_MAIL: z.email(),
    SYSTEM_MAIL: z.email(),
    BETTER_AUTH_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    GOOGLE_AUTH_CLIENT_ID: z.string().min(1),
    GOOGLE_AUTH_CLIENT_SECRET: z.string().min(1),
    SUPABASE_URL: z.url(),
    SUPABASE_SECRET_KEY: z.string().min(1),
    SUPABASE_STORAGE_BUCKET_NAME: z.string().min(1),
    SENTRY_DSN: z.url().optional(),
    SENTRY_ENVIRONMENT: z.string().optional(),
    SENTRY_RELEASE: z.string().optional(),
    SENTRY_TRACES_SAMPLE_RATE: z.string().optional(),
    SENTRY_DISABLED: z.enum(["true", "false"]).optional(),
  },
  runtimeEnv:
    process.env.NODE_ENV === "test"
      ? {
          NODE_ENV: "test",
          DATABASE_URL:
            "postgresql://postgres:postgres@localhost:5432/postgres",
          PORT: "8000",
          CSRF_TOKEN: "csrf_token",
          BULLMQ_SIGNING_SECRET: "bullmq_signing_secret",
          RESEND_API_KEY: "re_any_key_works",
          API_LOG_LEVEL: "info",
          REDIS_URL: "edis://username:password@host:port",
          CORS_ORIGIN: "http://localhost:3000",
          RESEND_INBOUND_WEBHOOK_SECRET: "resend_inbound_webhook_secret",
          RESEND_OUTBOUND_WEBHOOK_SECRET: "resend_outbound_webhook_secret",
          RESEND_EVENT_WEBHOOK_SECRET: "resend_event_webhook_secret",
          APP_NAME: "Acme",
          SITE_URL: "http://localhost:3000",
          DOMAIN_NAME: undefined,
          SUPPORT_MAIL: "support@example.com",
          SYSTEM_MAIL: "system@acme.com",
          BETTER_AUTH_URL: "http://localhost:8000",
          BETTER_AUTH_SECRET: "secret",
          GOOGLE_AUTH_CLIENT_ID: "client_id",
          GOOGLE_AUTH_CLIENT_SECRET: "client_secret",
          SUPABASE_URL: "https://example.supabase.co",
          SUPABASE_SECRET_KEY: "supabase_secret_key",
          SUPABASE_STORAGE_BUCKET_NAME: "bucket",
        }
      : {
          NODE_ENV: process.env.NODE_ENV,
          DATABASE_URL: process.env.DATABASE_URL,
          PORT: process.env.PORT,
          CSRF_TOKEN: process.env.CSRF_TOKEN,
          BULLMQ_SIGNING_SECRET: process.env.BULLMQ_SIGNING_SECRET,
          RESEND_API_KEY: process.env.RESEND_API_KEY,
          API_LOG_LEVEL: process.env.API_LOG_LEVEL,
          REDIS_URL: process.env.REDIS_URL,
          REDIS_TLS: process.env.REDIS_TLS,
          CORS_ORIGIN: process.env.CORS_ORIGIN,

          RESEND_INBOUND_WEBHOOK_SECRET:
            process.env.RESEND_INBOUND_WEBHOOK_SECRET,
          RESEND_OUTBOUND_WEBHOOK_SECRET:
            process.env.RESEND_OUTBOUND_WEBHOOK_SECRET,
          RESEND_EVENT_WEBHOOK_SECRET: process.env.RESEND_EVENT_WEBHOOK_SECRET,
          APP_NAME: process.env.APP_NAME,
          SITE_URL: process.env.SITE_URL,
          DOMAIN_NAME: process.env.DOMAIN_NAME,
          SUPPORT_MAIL: process.env.SUPPORT_MAIL,
          SYSTEM_MAIL: process.env.SYSTEM_MAIL,
          BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
          BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
          GOOGLE_AUTH_CLIENT_ID: process.env.GOOGLE_AUTH_CLIENT_ID,
          GOOGLE_AUTH_CLIENT_SECRET: process.env.GOOGLE_AUTH_CLIENT_SECRET,
          SUPABASE_URL: process.env.SUPABASE_URL,
          SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
          SUPABASE_STORAGE_BUCKET_NAME:
            process.env.SUPABASE_STORAGE_BUCKET_NAME,
          SENTRY_DSN: process.env.SENTRY_DSN,
          SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT,
          SENTRY_RELEASE: process.env.SENTRY_RELEASE,
          SENTRY_TRACES_SAMPLE_RATE: process.env.SENTRY_TRACES_SAMPLE_RATE,
          SENTRY_DISABLED: process.env.SENTRY_DISABLED,
        },
});

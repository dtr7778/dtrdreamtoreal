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
    RESEND_API_KEY: z.string().min(1),
    API_LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace"])
      .default("info"),
    REDIS_HOST: z.string().min(1),
    REDIS_PORT: z
      .string()
      .default("6379")
      .transform((arg) => parseInt(arg)),
    REDIS_USERNAME: z.string().min(1),
    REDIS_PASSWORD: z.string().min(1),
    GOOGLE_PSI_BASE_URL: z
      .url()
      .default("https://www.googleapis.com/pagespeedonline/v5"),
    GOOGLE_PSI_API_KEY: z.string().default(""),
    GOOGLE_CRUX_BASE_URL: z
      .url()
      .default("https://chromeuxreport.googleapis.com/v1"),
    GOOGLE_CRUX_API_KEY: z.string().default(""),
    SUPABASE_URL: z.url(),
    SUPABASE_SECRET_KEY: z.string().min(1),
    SUPABASE_STORAGE_BUCKET_NAME: z.string().min(1),
  },
  runtimeEnv:
    process.env.NODE_ENV === "test"
      ? {
          NODE_ENV: "test",
          DATABASE_URL:
            "postgresql://postgres:postgres@localhost:5432/postgres",
          RESEND_API_KEY: "re_any_key_works",
          API_LOG_LEVEL: "info",
          REDIS_HOST: "localhost",
          REDIS_PORT: "6379",
          REDIS_USERNAME: "default",
          REDIS_PASSWORD: "12345678",
          GOOGLE_PSI_API_KEY: "google_psi_api_key",
          GOOGLE_PSI_BASE_URL: "https://www.googleapis.com/pagespeedonline/v5",
          GOOGLE_CRUX_API_KEY: "google_crux_api_key",
          GOOGLE_CRUX_BASE_URL: "https://chromeuxreport.googleapis.com/v1",
          SUPABASE_URL: "https://example.supabase.co",
          SUPABASE_SECRET_KEY: "supabase_secret_key",
          SUPABASE_STORAGE_BUCKET_NAME: "bucket",
        }
      : {
          NODE_ENV: process.env.NODE_ENV,
          DATABASE_URL: process.env.DATABASE_URL,
          RESEND_API_KEY: process.env.RESEND_API_KEY,
          API_LOG_LEVEL: process.env.API_LOG_LEVEL,
          REDIS_HOST: process.env.REDIS_HOST,
          REDIS_PORT: process.env.REDIS_PORT,
          REDIS_USERNAME: process.env.REDIS_USERNAME,
          REDIS_PASSWORD: process.env.REDIS_PASSWORD,
          GOOGLE_PSI_API_KEY: process.env.GOOGLE_PSI_API_KEY,
          GOOGLE_PSI_BASE_URL: process.env.GOOGLE_PSI_BASE_URL,
          GOOGLE_CRUX_API_KEY: process.env.GOOGLE_CRUX_API_KEY,
          GOOGLE_CRUX_BASE_URL: process.env.GOOGLE_CRUX_BASE_URL,
          SUPABASE_URL: process.env.SUPABASE_URL,
          SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
          SUPABASE_STORAGE_BUCKET_NAME:
            process.env.SUPABASE_STORAGE_BUCKET_NAME,
        },
});

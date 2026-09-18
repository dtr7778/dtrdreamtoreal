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
    BACKEND_PORT: z
      .string()
      .default("8000")
      .transform((arg) => parseInt(arg)),
    CSRF_TOKEN: z.string().min(1),
    API_LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace"])
      .default("info"),
    REDIS_REST_URL: z.url().min(1),
    REDIS_REST_TOKEN: z.string().min(1),
    CORS_ORIGIN: z
      .string()
      .min(1)
      .transform((value) =>
        value
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean)
      ),
  },
  runtimeEnv:
    process.env.NODE_ENV === "test" ||
    process.env.SKIP_ENV_VALIDATION === "true"
      ? {
          NODE_ENV: "production",
          DATABASE_URL:
            "postgresql://postgres:postgres@localhost:5432/postgres",
          BACKEND_PORT: "8000",
          CSRF_TOKEN: "csrf_token",
          API_LOG_LEVEL: "info",
          REDIS_REST_URL: "http://localhost:6379",
          REDIS_REST_TOKEN: "token",
          CORS_ORIGIN: "http://localhost:3000",
        }
      : {
          NODE_ENV: process.env.NODE_ENV,
          DATABASE_URL: process.env.DATABASE_URL,
          BACKEND_PORT: process.env.BACKEND_PORT,
          CSRF_TOKEN: process.env.CSRF_TOKEN,
          API_LOG_LEVEL: process.env.API_LOG_LEVEL,
          REDIS_REST_URL: process.env.REDIS_REST_URL,
          REDIS_REST_TOKEN: process.env.REDIS_REST_TOKEN,
          CORS_ORIGIN: process.env.CORS_ORIGIN,
        },
});

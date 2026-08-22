import { createEnv } from "@t3-oss/env-nextjs"
import z from "zod"

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
        }
      : {
          NODE_ENV: process.env.NODE_ENV,
          NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
          NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
          NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
        },
})

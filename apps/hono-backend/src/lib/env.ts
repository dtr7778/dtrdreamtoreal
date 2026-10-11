import { z } from "zod";

const envSchema = z.object({
  ENVIRONMENT: z
    .enum(["development", "production", "test"] as const)
    .default("development"),
  APP_NAME: z.string().min(1),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"] as const)
    .default("debug"),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.url(),
  WEB_URL: z.url(),
  BACKEND_URL: z.url(),
  RESEND_API_KEY: z.string(),
  RESEND_INBOUND_WEBHOOK_SECRET: z.string(),
  RESEND_OUTBOUND_WEBHOOK_SECRET: z.string(),
  RESEND_EVENT_WEBHOOK_SECRET: z.string(),
  TRUSTED_ORIGINS: z
    .string()
    .min(1)
    .transform((value) =>
      value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    ),
  COOKIE_DOMAIN: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  MAIL_SYSTEM_EMAIL: z.email(),
  MAIL_SUPPORT_EMAIL: z.email(),
  R2_ACCOUNT_ID: z.string(),
  R2_BUCKET_NAME: z.string(),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
  R2_UPLOAD_TTL: z.coerce.number().int().positive().default(300),
  R2_DOWNLOAD_TTL: z.coerce.number().int().positive().default(3600),
});

export type EnvType = z.infer<typeof envSchema>;

function shouldSkipValidation(source: unknown): boolean {
  if (!source || typeof source !== "object") return false;

  const value = (source as Record<string, unknown>).SKIP_ENV_VALIDATION;

  return value === true || value === "true" || value === "1";
}

function parseFieldsLeniently(source: Record<string, unknown>): EnvType {
  const result: Record<string, unknown> = { ...source };

  for (const [key, field] of Object.entries(envSchema.shape)) {
    const parsed = field.safeParse(source[key]);
    if (parsed.success) {
      result[key] = parsed.data;
    }
  }

  return result as EnvType;
}

export function validateEnv(source: unknown): EnvType {
  const { success, data, error } = envSchema.safeParse(source);

  if (success) {
    return data;
  }

  if (shouldSkipValidation(source) && source && typeof source === "object") {
    return parseFieldsLeniently(source as Record<string, unknown>);
  }

  throw error;
}

export function getEnv<TKey extends keyof EnvType>(
  varName: TKey
): EnvType[TKey] {
  const envVars = validateEnv(process.env);
  return envVars[varName];
}

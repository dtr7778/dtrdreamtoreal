import { z } from "zod";
declare const envSchema: z.ZodObject<{
    ENVIRONMENT: z.ZodDefault<z.ZodEnum<{
        production: "production";
        development: "development";
        test: "test";
    }>>;
    APP_NAME: z.ZodString;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<{
        info: "info";
        fatal: "fatal";
        error: "error";
        warn: "warn";
        debug: "debug";
        trace: "trace";
    }>>;
    BETTER_AUTH_SECRET: z.ZodString;
    BETTER_AUTH_URL: z.ZodURL;
    WEB_URL: z.ZodURL;
    BACKEND_URL: z.ZodURL;
    RESEND_API_KEY: z.ZodString;
    RESEND_INBOUND_WEBHOOK_SECRET: z.ZodString;
    RESEND_OUTBOUND_WEBHOOK_SECRET: z.ZodString;
    RESEND_EVENT_WEBHOOK_SECRET: z.ZodString;
    TRUSTED_ORIGINS: z.ZodPipe<z.ZodString, z.ZodTransform<string[], string>>;
    COOKIE_DOMAIN: z.ZodOptional<z.ZodString>;
    GOOGLE_CLIENT_ID: z.ZodString;
    GOOGLE_CLIENT_SECRET: z.ZodString;
    MAIL_SYSTEM_EMAIL: z.ZodEmail;
    MAIL_SUPPORT_EMAIL: z.ZodEmail;
    R2_ACCOUNT_ID: z.ZodString;
    R2_BUCKET_NAME: z.ZodString;
    R2_ACCESS_KEY_ID: z.ZodString;
    R2_SECRET_ACCESS_KEY: z.ZodString;
    R2_UPLOAD_TTL: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    R2_DOWNLOAD_TTL: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type EnvType = z.infer<typeof envSchema>;
export declare function validateEnv(source: unknown): EnvType;
export declare function getEnv<TKey extends keyof EnvType>(varName: TKey): EnvType[TKey];
export {};
//# sourceMappingURL=env.d.ts.map
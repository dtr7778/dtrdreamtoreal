import { afterEach, describe, expect, it, vi } from "vitest";
import { validateEnv } from "@/lib/env";
const validEnv = {
    ENVIRONMENT: "production",
    APP_NAME: "Dream To Real",
    LOG_LEVEL: "warn",
    BETTER_AUTH_SECRET: "secret",
    BETTER_AUTH_URL: "https://api.dtrdreamtoreal.com",
    WEB_URL: "https://dtrdreamtoreal.com",
    BACKEND_URL: "https://api.dtrdreamtoreal.com",
    RESEND_API_KEY: "resend_api_key",
    RESEND_INBOUND_WEBHOOK_SECRET: "whsec_inbound",
    RESEND_OUTBOUND_WEBHOOK_SECRET: "whsec_outbound",
    RESEND_EVENT_WEBHOOK_SECRET: "whsec_event",
    TRUSTED_ORIGINS: "https://dtrdreamtoreal.com,https://app.dtrdreamtoreal.com",
    COOKIE_DOMAIN: ".dtrdreamtoreal.com",
    GOOGLE_CLIENT_ID: "google-client-id",
    GOOGLE_CLIENT_SECRET: "google-client-secret",
    MAIL_SYSTEM_EMAIL: "notification@mail.dtrdreamtoreal.com",
    MAIL_SUPPORT_EMAIL: "support@mail.dtrdreamtoreal.com",
    R2_ACCOUNT_ID: "account-id",
    R2_BUCKET_NAME: "bucket",
    R2_ACCESS_KEY_ID: "access-key-id",
    R2_SECRET_ACCESS_KEY: "secret-access-key",
};
afterEach(() => {
    vi.restoreAllMocks();
});
describe("validateEnv", () => {
    it("parses a valid environment", () => {
        const result = validateEnv(validEnv);
        expect(result.TRUSTED_ORIGINS).toEqual([
            "https://dtrdreamtoreal.com",
            "https://app.dtrdreamtoreal.com",
        ]);
        expect(result.R2_UPLOAD_TTL).toBe(300);
    });
    it("throws when the environment is invalid and validation is not skipped", () => {
        vi.spyOn(console, "log").mockImplementation(() => undefined);
        expect(() => validateEnv({ APP_NAME: "Dream To Real" })).toThrow();
    });
    it("skips throwing when SKIP_ENV_VALIDATION is set", () => {
        const source = { SKIP_ENV_VALIDATION: "true", APP_NAME: "Dream To Real" };
        expect(() => validateEnv(source)).not.toThrow();
    });
    it("still applies field transforms while validation is skipped", () => {
        const source = {
            SKIP_ENV_VALIDATION: "true",
            TRUSTED_ORIGINS: "https://dtrdreamtoreal.com, https://app.dtrdreamtoreal.com",
        };
        const result = validateEnv(source);
        expect(result.TRUSTED_ORIGINS).toEqual([
            "https://dtrdreamtoreal.com",
            "https://app.dtrdreamtoreal.com",
        ]);
    });
});

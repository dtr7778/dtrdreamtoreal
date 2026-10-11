import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "@/app";
const { handler, appEnv } = vi.hoisted(() => {
    const env = {
        ENVIRONMENT: "production",
        APP_NAME: "app_name",
        LOG_LEVEL: "warn",
        BETTER_AUTH_SECRET: "better_auth_secret",
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
    Object.assign(process.env, env);
    return { handler: vi.fn(), appEnv: env };
});
vi.mock("cloudflare:workers", () => ({ env: appEnv }));
vi.mock("@/lib/auth", () => ({
    getAuth: () => ({ handler }),
}));
describe("api app", () => {
    beforeEach(() => {
        handler.mockReset();
        handler.mockResolvedValue(new Response("ok", { status: 200 }));
    });
    it("serves a public health check", async () => {
        const res = await app.request("/health", {}, appEnv);
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({
            success: true,
            statusCode: 200,
            message: "health",
            data: null,
        });
    });
});

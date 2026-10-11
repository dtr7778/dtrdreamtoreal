import { createBetterAuth } from "@workspace/auth";
import { createDrizzleClient } from "@workspace/drizzle/client";
import { logger } from "@workspace/lib/logger";
import { createMailService } from "@workspace/mail/factory";
import { getEnv } from "./env";
let cache = null;
function buildAuth(env) {
    const database = createDrizzleClient(env.DB);
    const mailService = createMailService({
        database,
        queue: env.MAIL_QUEUE,
        mailConfig: {
            appName: getEnv("APP_NAME"),
            systemMail: getEnv("MAIL_SYSTEM_EMAIL"),
            supportMail: getEnv("MAIL_SUPPORT_EMAIL"),
        },
    });
    return createBetterAuth({
        appName: getEnv("APP_NAME"),
        secret: getEnv("BETTER_AUTH_SECRET"),
        isDev: getEnv("ENVIRONMENT") === "development",
        baseURL: getEnv("BETTER_AUTH_URL"),
        siteURL: getEnv("WEB_URL"),
        trustedOrigins: getEnv("TRUSTED_ORIGINS"),
        cookieDomain: getEnv("COOKIE_DOMAIN"),
        errorPagePath: `${getEnv("WEB_URL")}/auth-error`,
        logger: logger({
            serviceName: "dtrdreamtoreal-auth",
            logLevel: getEnv("LOG_LEVEL"),
        }),
        database,
        mailHooks: mailService,
        google: {
            clientId: getEnv("GOOGLE_CLIENT_ID"),
            clientSecret: getEnv("GOOGLE_CLIENT_SECRET"),
            redirectURI: `${getEnv("BETTER_AUTH_URL")}/api/auth/callback/google`,
        },
    });
}
/**
 * Build (and memoize per isolate) the better-auth instance for a Worker env.
 */
export function getAuth(env) {
    if (!cache || cache.env !== env) {
        cache = { env, auth: buildAuth(env) };
    }
    return cache.auth;
}

import { configureOpenAPI, createApp } from "@workspace/server-core";
import { getAuth } from "@/lib/auth";
import { getEnv } from "@/lib/env";
import mailRouter from "@/modules/mail";
import uploadRouter from "@/modules/upload";
import packageJSON from "../package.json" with { type: "json" };
const app = createApp({
    logger: {
        serviceName: "Hono backend",
        logLevel: getEnv("LOG_LEVEL"),
    },
    cors: {
        trustedOrigins: getEnv("TRUSTED_ORIGINS"),
    },
    csrf: {
        trustedOrigins: getEnv("TRUSTED_ORIGINS"),
    },
});
app.on(["GET", "POST"], "/api/auth/*", (c) => getAuth(c.env).handler(c.req.raw));
configureOpenAPI(app, {
    title: "Hono backend",
    version: packageJSON.version,
});
const routes = [mailRouter, uploadRouter];
routes.forEach((route) => {
    app.route("/", route);
});
export default app;

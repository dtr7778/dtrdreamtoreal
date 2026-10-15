import { configureOpenAPI, createApp } from "@workspace/server-core";

import { getAuth } from "@/lib/auth";
import { getEnv } from "@/lib/env";

import chatRouter from "@/modules/chat";
import mailRouter from "@/modules/mail";
import uploadRouter from "@/modules/upload";
import type { ApiVariables, AppEnv } from "@/types";

import packageJSON from "../package.json" with { type: "json" };

const app = createApp<AppEnv, ApiVariables>({
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

app.on(["GET", "POST"], "/api/auth/*", (c) =>
  getAuth(c.env).handler(c.req.raw)
);

configureOpenAPI(app, {
  title: "Hono backend",
  version: packageJSON.version,
});

const routes = [mailRouter, chatRouter, uploadRouter] as const;

routes.forEach((route) => {
  app.route("/", route);
});

export type AppType = (typeof routes)[number];

export default app;

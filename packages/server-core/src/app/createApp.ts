import { csrf } from "hono/csrf";
import { requestId } from "hono/request-id";

import { type LoggerConfig } from "@workspace/lib/logger";

import { apiResponse } from "../helpers";
import type { CorsConfig } from "../middlewares";
import {
  corsMiddleware,
  errorMiddleware,
  loggerMiddleware,
  notFoundMiddleware,
} from "../middlewares";
import { OK } from "../utils";
import { createRouter } from "./createRouter";

interface CreateAppConfig {
  cors: CorsConfig;
  csrf: {
    trustedOrigins: string[];
  };
  logger: LoggerConfig;
}

export function createApp<E extends object, V extends object>(
  config: CreateAppConfig
) {
  const app = createRouter<E, V>();

  app.get("/health", (c) =>
    apiResponse(c, {
      statusCode: OK,
      success: true,
      message: "health",
      data: null,
    })
  );

  app
    .use(requestId())
    .use("*", corsMiddleware(config.cors))
    .use("*", loggerMiddleware(config.logger))
    .use("*", csrf({ origin: config.csrf.trustedOrigins }));

  app.notFound(notFoundMiddleware);
  app.onError(errorMiddleware);

  return app;
}

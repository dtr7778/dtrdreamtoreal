import type { Schema } from "hono";
import { requestId } from "hono/request-id";

import { errorMiddleware, notFoundMiddleware } from "../middlewares";
import type { AppOpenAPI } from "../types";
import { createRouter } from "./createRouter";

export function createTestApp<
  S extends Schema,
  E extends object = object,
  V extends object = object,
>(router: AppOpenAPI<S, E, V>) {
  const app = createRouter<E, V>();

  app.use(requestId());

  app.route("/", router);

  app.notFound(notFoundMiddleware);
  app.onError(errorMiddleware);

  return app;
}

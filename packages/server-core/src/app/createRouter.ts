import { OpenAPIHono } from "@hono/zod-openapi";

import type { AppBindings } from "../types";
import { defaultHonoHook } from "../utils";

export function createRouter<E extends object, V extends object>() {
  return new OpenAPIHono<AppBindings<E, V>>({
    strict: false,
    defaultHook: defaultHonoHook,
  });
}

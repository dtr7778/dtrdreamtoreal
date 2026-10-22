import { createRouter } from "@workspace/server-core";

import type { ApiVariables, AppEnv } from "@/types";

import * as handlers from "./task.handlers";
import * as routes from "./task.routes";

const router = createRouter<AppEnv, ApiVariables>().openapi(
  routes.taskWebSocketRoute,
  handlers.taskWebSocketHandler
);

export default router;

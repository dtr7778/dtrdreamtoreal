import { createRouter } from "@workspace/server-core";

import type { ApiVariables, AppEnv } from "@/types";

import * as handlers from "./chat.handlers";
import * as routes from "./chat.routes";

const router = createRouter<AppEnv, ApiVariables>()
  .openapi(routes.chatWebSocketRoute, handlers.chatWebSocketHandler)
  .openapi(routes.sendMessageRoute, handlers.sendMessageHandler)
  .openapi(routes.toggleReactionRoute, handlers.toggleReactionHandler)
  .openapi(routes.markRoomReadRoute, handlers.markRoomReadHandler);

export default router;

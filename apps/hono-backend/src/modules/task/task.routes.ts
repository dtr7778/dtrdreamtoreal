import { createRoute } from "@hono/zod-openapi";

import { SWITCHING_PROTOCOLS } from "@workspace/server-core";

const tags = ["task"];

export const taskWebSocketRoute = createRoute({
  method: "get",
  path: "/task/ws",
  summary: "Open the realtime task WebSocket",
  tags,
  responses: {
    [SWITCHING_PROTOCOLS]: {
      description: "Switching protocols to WebSocket",
    },
  },
});

export type TaskWebSocketRouteType = typeof taskWebSocketRoute;

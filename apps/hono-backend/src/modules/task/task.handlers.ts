import { apiResponse, UPGRADE_REQUIRED } from "@workspace/server-core";

import { getAuth } from "@/lib/auth";
import { getAuthUser } from "@/lib/getAuthUser";

import type { ApiRouteHandler } from "@/types";

import { TASK_HUB_NAME } from "./task-hub.do";
import type { TaskWebSocketRouteType } from "./task.routes";

export const taskWebSocketHandler: ApiRouteHandler<
  TaskWebSocketRouteType
> = async (c) => {
  if (c.req.header("Upgrade")?.toLowerCase() !== "websocket") {
    return apiResponse(c, {
      success: false,
      statusCode: UPGRADE_REQUIRED,
      message: "Expected WebSocket upgrade",
      data: null,
    });
  }

  const auth = getAuth(c.env);

  const authData = await getAuthUser(auth, c.req.raw.headers);

  const headers = new Headers(c.req.raw.headers);
  headers.set("x-user-id", authData.user.id);

  const stub = c.env.TASK_HUB.getByName(TASK_HUB_NAME);

  return stub.fetch(new Request(c.req.raw.url, { headers }));
};

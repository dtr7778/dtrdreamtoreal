import { DurableObject } from "cloudflare:workers";

import type {
  TaskRealtimeClientEvent,
  TaskRealtimePublishPayload,
  TaskRealtimeServerEvent,
} from "@workspace/lib/types";
import {
  SWITCHING_PROTOCOLS,
  UNAUTHORIZED,
  UPGRADE_REQUIRED,
} from "@workspace/server-core";

import type { AppEnv } from "@/types";

type SocketAttachment = {
  userId: string;
};

export const TASK_HUB_NAME = "global";

/**
 * Single instance that holds every connected task socket.
 *
 * Task mutations are written by the dashboard oRPC procedures, which publish a
 * lightweight `task_changed` event here through the `TaskEntrypoint` service
 * binding. Clients then refetch through oRPC, so no task payloads are sent over
 * the socket. Uses the WebSocket Hibernation API so idle connections are cheap.
 */
export class TaskHubDurableObject extends DurableObject<AppEnv> {
  private getSockets() {
    return this.ctx.getWebSockets();
  }

  private getAttachment(socket: WebSocket) {
    return (socket.deserializeAttachment() as SocketAttachment | null) ?? null;
  }

  private send(socket: WebSocket, event: TaskRealtimeServerEvent) {
    try {
      socket.send(JSON.stringify(event));
    } catch {
      // Socket already closed; ignore.
    }
  }

  private publish({ audience, change }: TaskRealtimePublishPayload) {
    const event = {
      type: "task_changed",
      data: change,
    } satisfies TaskRealtimeServerEvent;

    const targetIds =
      audience.type === "users" ? new Set(audience.userIds) : null;

    for (const socket of this.getSockets()) {
      const attachment = this.getAttachment(socket);
      if (!attachment) continue;
      if (targetIds && !targetIds.has(attachment.userId)) continue;

      this.send(socket, event);
    }
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.endsWith("/publish")) {
      const payload = (await request.json()) as TaskRealtimePublishPayload;
      this.publish(payload);
      return new Response("ok");
    }

    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket upgrade", {
        status: UPGRADE_REQUIRED,
      });
    }

    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return new Response("Missing authenticated user", {
        status: UNAUTHORIZED,
      });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ userId } satisfies SocketAttachment);

    return new Response(null, {
      status: SWITCHING_PROTOCOLS,
      webSocket: client,
    });
  }

  async webSocketMessage(
    socket: WebSocket,
    message: string | ArrayBuffer
  ): Promise<void> {
    let event: TaskRealtimeClientEvent;

    try {
      event = JSON.parse(
        typeof message === "string"
          ? message
          : new TextDecoder().decode(message)
      ) as TaskRealtimeClientEvent;
    } catch {
      return;
    }

    if (event.type === "ping") {
      this.send(socket, { type: "pong" });
    }
  }
}

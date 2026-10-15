import { DurableObject } from "cloudflare:workers";
import { eq } from "drizzle-orm";

import { createDrizzleClient } from "@workspace/drizzle/client";
import { ChatRoomMemberTable } from "@workspace/drizzle/schemas";
import type {
  ChatRealtimeClientEvent,
  ChatRealtimeServerEvent,
} from "@workspace/lib/types";

import type { AppEnv } from "@/types";

type SocketAttachment = {
  userId: string;
};

type PublishPayload = {
  userIds: Array<string>;
  event: ChatRealtimeServerEvent;
};

const MEMBER_CACHE_TTL_MS = 60_000;
const HUB_NAME = "global";

/**
 * Single instance that holds every connected chat socket across all rooms.
 *
 * A user connects once (no room id); durable room events are published to it
 * by the hono-backend chat handlers, while typing and presence are fanned out
 * from here. Uses the WebSocket Hibernation API so idle connections are cheap.
 */
export class ChatHubDurableObject extends DurableObject<AppEnv> {
  private memberCache = new Map<
    string,
    { userIds: Array<string>; at: number }
  >();

  private getSockets() {
    return this.ctx.getWebSockets();
  }

  private getAttachment(socket: WebSocket) {
    return (socket.deserializeAttachment() as SocketAttachment | null) ?? null;
  }

  private getOnlineUserIds() {
    const userIds = new Set<string>();

    for (const socket of this.getSockets()) {
      const attachment = this.getAttachment(socket);
      if (attachment) userIds.add(attachment.userId);
    }

    return [...userIds];
  }

  private isUserOnline(userId: string) {
    return this.getOnlineUserIds().includes(userId);
  }

  private broadcastToAll(event: ChatRealtimeServerEvent, except?: WebSocket) {
    const message = JSON.stringify(event);

    for (const socket of this.getSockets()) {
      if (socket === except) continue;
      try {
        socket.send(message);
      } catch {
        // Socket already closed; ignore.
      }
    }
  }

  private broadcastToUsers(
    userIds: Set<string>,
    event: ChatRealtimeServerEvent,
    exceptUserId?: string
  ) {
    const message = JSON.stringify(event);

    for (const socket of this.getSockets()) {
      const attachment = this.getAttachment(socket);
      if (!attachment || !userIds.has(attachment.userId)) continue;
      if (attachment.userId === exceptUserId) continue;
      try {
        socket.send(message);
      } catch {
        // Socket already closed; ignore.
      }
    }
  }

  private async getRoomMemberIds(roomId: string): Promise<Array<string>> {
    const cached = this.memberCache.get(roomId);
    if (cached && Date.now() - cached.at < MEMBER_CACHE_TTL_MS) {
      return cached.userIds;
    }

    const database = createDrizzleClient(this.env.DB);
    const rows = await database
      .select({ userId: ChatRoomMemberTable.userId })
      .from(ChatRoomMemberTable)
      .where(eq(ChatRoomMemberTable.roomId, roomId));

    const userIds = rows.map((row) => row.userId);
    this.memberCache.set(roomId, { userIds, at: Date.now() });

    return userIds;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.endsWith("/publish")) {
      const { userIds, event } = (await request.json()) as PublishPayload;
      this.broadcastToUsers(new Set(userIds), event);
      return new Response("ok");
    }

    if (url.pathname.endsWith("/presence")) {
      return Response.json({ userIds: this.getOnlineUserIds() });
    }

    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }

    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return new Response("Missing authenticated user", { status: 401 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    const wasOnline = this.isUserOnline(userId);
    const onlineUserIds = this.getOnlineUserIds();

    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ userId } satisfies SocketAttachment);

    server.send(
      JSON.stringify({
        type: "presence_sync",
        data: { userIds: onlineUserIds },
      } satisfies ChatRealtimeServerEvent)
    );

    if (!wasOnline) {
      this.broadcastToAll(
        {
          type: "presence",
          data: { userId, online: true },
        },
        server
      );
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(
    socket: WebSocket,
    message: string | ArrayBuffer
  ): Promise<void> {
    const attachment = this.getAttachment(socket);
    if (!attachment) return;

    let event: ChatRealtimeClientEvent;
    try {
      event = JSON.parse(
        typeof message === "string"
          ? message
          : new TextDecoder().decode(message)
      ) as ChatRealtimeClientEvent;
    } catch {
      return;
    }

    if (event.type === "ping") {
      socket.send(
        JSON.stringify({ type: "pong" } satisfies ChatRealtimeServerEvent)
      );
      return;
    }

    if (event.type === "typing") {
      const memberIds = await this.getRoomMemberIds(event.roomId);

      this.broadcastToUsers(
        new Set(memberIds),
        {
          type: "typing",
          roomId: event.roomId,
          data: { userId: attachment.userId, isTyping: event.isTyping },
        },
        attachment.userId
      );
    }
  }

  async webSocketClose(socket: WebSocket): Promise<void> {
    this.handleDisconnect(socket);
  }

  async webSocketError(socket: WebSocket): Promise<void> {
    this.handleDisconnect(socket);
  }

  private handleDisconnect(socket: WebSocket) {
    const attachment = this.getAttachment(socket);
    if (!attachment) return;

    this.ctx.waitUntil(
      Promise.resolve().then(() => {
        if (this.isUserOnline(attachment.userId)) return;

        this.broadcastToAll(
          {
            type: "presence",
            data: { userId: attachment.userId, online: false },
          },
          socket
        );
      })
    );
  }
}

export const CHAT_HUB_NAME = HUB_NAME;

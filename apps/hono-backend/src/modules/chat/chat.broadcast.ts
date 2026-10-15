import { eq } from "drizzle-orm";

import { createDrizzleClient } from "@workspace/drizzle/client";
import { ChatRoomMemberTable } from "@workspace/drizzle/schemas";
import type { ChatRealtimeServerEvent } from "@workspace/lib/types";

import type { AppEnv } from "@/types";

import { CHAT_HUB_NAME } from "./chat-hub.do";

/**
 * Publishes a durable chat event to every member of a room over the global
 * realtime hub. Runs in-process inside the hono-backend worker, so no
 * cross-worker RPC is involved.
 */
export async function broadcastToRoom(
  env: AppEnv,
  roomId: string,
  event: ChatRealtimeServerEvent
) {
  try {
    const database = createDrizzleClient(env.DB);

    const members = await database
      .select({ userId: ChatRoomMemberTable.userId })
      .from(ChatRoomMemberTable)
      .where(eq(ChatRoomMemberTable.roomId, roomId));

    const stub = env.CHAT_HUB.getByName(CHAT_HUB_NAME);

    await stub.fetch("https://chat-hub.internal/publish", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userIds: members.map((member) => member.userId),
        event,
      }),
    });
  } catch (error) {
    console.error("Failed to broadcast chat event", error);
  }
}

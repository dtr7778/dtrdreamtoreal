import { and, eq } from "drizzle-orm";

import type { DatabaseType } from "@workspace/drizzle/client";
import { ChatRoomMemberTable, ChatRoomTable } from "@workspace/drizzle/schemas";

export async function getRoom(db: DatabaseType, roomId: string) {
  const [room] = await db
    .select()
    .from(ChatRoomTable)
    .where(eq(ChatRoomTable.id, roomId))
    .limit(1);

  return room ?? null;
}

export async function getRoomMembership(
  db: DatabaseType,
  roomId: string,
  userId: string
) {
  const [membership] = await db
    .select()
    .from(ChatRoomMemberTable)
    .where(
      and(
        eq(ChatRoomMemberTable.roomId, roomId),
        eq(ChatRoomMemberTable.userId, userId)
      )
    )
    .limit(1);

  return membership ?? null;
}

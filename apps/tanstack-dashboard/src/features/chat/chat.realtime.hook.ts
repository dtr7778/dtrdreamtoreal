import { useCallback } from "react";

import { useChatRealtimeContext } from "./components/ChatRealtimeProvider";

/**
 * Room-scoped view over the single dashboard realtime socket. Presence is
 * global; typing is filtered to the given room.
 */
export function useChatRealtime({ roomId }: { roomId: string }) {
  const { onlineUserIds, typingByRoom, sendTyping } = useChatRealtimeContext();

  const typingUserIds = typingByRoom[roomId] ?? [];

  const roomSendTyping = useCallback(
    (isTyping: boolean) => sendTyping(roomId, isTyping),
    [sendTyping, roomId]
  );

  return { typingUserIds, onlineUserIds, sendTyping: roomSendTyping };
}

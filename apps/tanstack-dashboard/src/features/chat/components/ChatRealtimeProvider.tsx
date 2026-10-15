import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { apiClient } from "#/lib/hono-api";
import { orpcTQClient } from "#/server/orpc";
import { useAuthStore } from "#/stores/zustand/auth/AuthStoreContext";
import { useQueryClient } from "@tanstack/react-query";

import type { ChatRealtimeServerEvent } from "@workspace/lib/types";
import { useAsRef } from "@workspace/ui/hooks/use-as-ref";

import {
  updateMessageInCaches,
  upsertMessageInCaches,
} from "../api/chat.api.hook";

const TYPING_TIMEOUT_MS = 4000;
const PING_INTERVAL_MS = 25000;
const RECONNECT_DELAY_MS = 2000;

type TypingByRoom = Record<string, Array<string>>;

type ChatRealtimeContextValue = {
  onlineUserIds: Array<string>;
  typingByRoom: TypingByRoom;
  sendTyping: (roomId: string, isTyping: boolean) => void;
};

const ChatRealtimeContext = createContext<ChatRealtimeContextValue | null>(
  null
);

/**
 * Owns the WebSocket lifecycle: connect, ping keep-alive, auto-reconnect.
 * Events are delivered through a ref, so changing `onEvent` never reconnects.
 */
function useChatSocket(onEvent: (event: ChatRealtimeServerEvent) => void) {
  const socketRef = useRef<WebSocket | null>(null);
  const onEventRef = useAsRef(onEvent);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let disposed = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let pingTimer: ReturnType<typeof setInterval> | undefined;

    const stopPing = () => {
      if (pingTimer) clearInterval(pingTimer);
      pingTimer = undefined;
    };

    const connect = () => {
      const socket = new WebSocket(apiClient.chat.ws.$url());
      socketRef.current = socket;

      socket.onopen = () => {
        stopPing();
        pingTimer = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "ping" }));
          }
        }, PING_INTERVAL_MS);
      };

      socket.onmessage = (messageEvent) => {
        try {
          onEventRef.current(
            JSON.parse(messageEvent.data as string) as ChatRealtimeServerEvent
          );
        } catch {
          // Ignore malformed payloads.
        }
      };

      socket.onclose = () => {
        stopPing();
        if (!disposed) reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
      };

      socket.onerror = () => socket.close();
    };

    connect();

    return () => {
      disposed = true;
      stopPing();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [onEventRef]);

  return useCallback((message: Record<string, unknown>) => {
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }, []);
}

/** Tracks who is typing per room; each indicator expires automatically. */
function useTypingIndicators(resetKey: string | undefined) {
  const [typingByRoom, setTypingByRoom] = useState<TypingByRoom>({});
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const remove = useCallback((roomId: string, userId: string) => {
    setTypingByRoom((prev) => {
      const current = prev[roomId];
      if (!current?.includes(userId)) return prev;
      return { ...prev, [roomId]: current.filter((id) => id !== userId) };
    });
  }, []);

  const setTyping = useCallback(
    (roomId: string, userId: string, isTyping: boolean) => {
      const key = `${roomId}:${userId}`;
      const existing = timers.current.get(key);
      if (existing) clearTimeout(existing);
      timers.current.delete(key);

      if (!isTyping) {
        remove(roomId, userId);
        return;
      }

      setTypingByRoom((prev) => {
        const current = prev[roomId] ?? [];
        if (current.includes(userId)) return prev;
        return { ...prev, [roomId]: [...current, userId] };
      });
      timers.current.set(
        key,
        setTimeout(() => {
          timers.current.delete(key);
          remove(roomId, userId);
        }, TYPING_TIMEOUT_MS)
      );
    },
    [remove]
  );

  // Reset everything when the user changes or the provider unmounts.
  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      for (const timer of activeTimers.values()) clearTimeout(timer);
      activeTimers.clear();
      setTypingByRoom({});
    };
  }, [resetKey]);

  return { typingByRoom, setTyping };
}

/** Tracks online users from `presence` and `presence_sync` events. */
function useOnlineUsers(resetKey: string | undefined) {
  const [onlineUserIds, setOnlineUserIds] = useState<Array<string>>([]);

  const setPresence = useCallback((userId: string, online: boolean) => {
    setOnlineUserIds((prev) => {
      const has = prev.includes(userId);
      if (online) return has ? prev : [...prev, userId];
      return has ? prev.filter((id) => id !== userId) : prev;
    });
  }, []);

  useEffect(() => () => setOnlineUserIds([]), [resetKey]);

  return { onlineUserIds, setPresence, setOnlineUserIds };
}

/**
 * Single per-user WebSocket for every chat room. Mounted once for the whole
 * dashboard so new messages in rooms the user is not currently viewing still
 * update the conversation list and unread badges in realtime.
 */
export function ChatRealtimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.user.id);

  const { typingByRoom, setTyping } = useTypingIndicators(currentUserId);
  const { onlineUserIds, setPresence, setOnlineUserIds } =
    useOnlineUsers(currentUserId);

  const handleEvent = useCallback(
    (event: ChatRealtimeServerEvent) => {
      const invalidateRooms = () =>
        void queryClient.invalidateQueries({
          queryKey: orpcTQClient.chat.listConversation.queryKey({ input: {} }),
          exact: false,
        });

      switch (event.type) {
        case "message":
          upsertMessageInCaches(queryClient, event.roomId, event.data);
          invalidateRooms();
          break;
        case "reaction": {
          updateMessageInCaches(
            queryClient,
            event.data.roomId,
            event.data.id,
            () => event.data
          );
          break;
        }
        case "read":
          invalidateRooms();
          break;
        case "typing":
          if (event.data.userId !== currentUserId) {
            setTyping(event.roomId, event.data.userId, event.data.isTyping);
          }
          break;
        case "presence":
          setPresence(event.data.userId, event.data.online);
          break;
        case "presence_sync":
          setOnlineUserIds(event.data.userIds);
          break;
        case "pong":
          break;
      }
    },
    [queryClient, currentUserId, setTyping, setPresence, setOnlineUserIds]
  );

  const send = useChatSocket(handleEvent);

  const sendTyping = useCallback(
    (roomId: string, isTyping: boolean) =>
      send({ type: "typing", roomId, isTyping }),
    [send]
  );

  const value = useMemo(
    () => ({ onlineUserIds, typingByRoom, sendTyping }),
    [onlineUserIds, typingByRoom, sendTyping]
  );

  return (
    <ChatRealtimeContext.Provider value={value}>
      {children}
    </ChatRealtimeContext.Provider>
  );
}

export function useChatRealtimeContext() {
  const context = useContext(ChatRealtimeContext);
  if (!context) {
    throw new Error(
      "useChatRealtimeContext must be used within ChatRealtimeProvider"
    );
  }
  return context;
}

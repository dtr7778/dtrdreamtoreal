import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { RefObject } from "react";

import { useAuthStore } from "#/stores/zustand/auth/AuthStoreContext";
import type { InfiniteData } from "@tanstack/react-query";

import type { ChatMemberType, ChatMessageItemType } from "@workspace/lib/chat";
import { useAsRef } from "@workspace/ui/hooks/use-as-ref";

import { useMarkRoomRead, useToggleReaction } from "../../api/chat.api.hook";
import type {
  ListMessagesContractType,
  RoomDetailsContractType,
} from "../../api/chat.contract";
import type { MessageCursorType } from "../../chat.cursor";
import { useChatRealtime } from "../../chat.realtime.hook";
import type { UnreadLayout } from "../../chat.unread";
import { getUnreadLayout } from "../../chat.unread";
import type { MessageListHandle } from "../message/MessageList";

const TYPING_IDLE_MS = 1500;

/**
 * Returns a callback to call on every keystroke: it broadcasts "typing" and
 * automatically broadcasts "stopped typing" after a short idle period.
 */
function useTypingActivity(sendTyping: (isTyping: boolean) => void) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const sendTypingRef = useAsRef(sendTyping);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    []
  );

  return useCallback(() => {
    sendTypingRef.current(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(
      () => sendTypingRef.current(false),
      TYPING_IDLE_MS
    );
  }, []);
}

export type ChatRoomContextValue = {
  roomId: string;
  currentUserId: string;
  timezone?: string | null;
  typingUserIds: Array<string>;
  onlineUserIds: Array<string>;
  roomDetails: RoomDetailsContractType["output"]["data"];
  members: Array<ChatMemberType>;
  replyTo: ChatMessageItemType | null;
  setReplyTo: (message: ChatMessageItemType | null) => void;
  onReact: (message: ChatMessageItemType, emoji: string) => void;
  onReply: (message: ChatMessageItemType) => void;
  onCancelReply: () => void;
  onActivity: () => void;
  messageListRef: RefObject<MessageListHandle | null>;
  allMessages: Array<ChatMessageItemType>;
  threadRoot?: ChatMessageItemType;
  unreadLayout: UnreadLayout;
  onJumpToLatest: () => void;
  onMessageVisible?: (message: ChatMessageItemType) => void;
};

export const ChatRoomContext = createContext<ChatRoomContextValue | null>(null);

interface ChatRoomProviderProps {
  roomId: string;
  threadId?: string;
  roomDetails: RoomDetailsContractType["output"]["data"];
  messages: InfiniteData<
    ListMessagesContractType["output"]["data"],
    MessageCursorType | null
  >;
  hasNewer: boolean;
  isFetchingNewer: boolean;
  fetchNewer: () => void;
  children: React.ReactNode;
}

export function ChatRoomProvider({
  roomId,
  threadId,
  roomDetails,
  messages,
  hasNewer,
  isFetchingNewer,
  fetchNewer,
  children,
}: ChatRoomProviderProps) {
  const user = useAuthStore((state) => state.user);
  const { typingUserIds, onlineUserIds, sendTyping } = useChatRealtime({
    roomId,
  });
  const onActivity = useTypingActivity(sendTyping);
  const messageListRef = useRef<MessageListHandle | null>(null);

  const [replyTo, setReplyTo] = useState<ChatMessageItemType | null>(null);
  const [isJumpingToLatest, setIsJumpingToLatest] = useState(false);

  const toggleReaction = useToggleReaction({ roomId });
  const { mutate: markRead } = useMarkRoomRead();
  const lastMarkedAtRef = useRef<Date | null>(null);

  const allMessages = useMemo(
    () => messages.pages.flatMap((page) => page.items),
    [messages]
  );

  const unreadLayout = useMemo(
    () => getUnreadLayout(messages, roomDetails.myMembership.lastReadMessageId),
    [messages, roomDetails.myMembership.lastReadMessageId]
  );

  const { readBoundaryAt } = unreadLayout;

  const onMessageVisible = useCallback(
    (message: ChatMessageItemType) => {
      if (readBoundaryAt && message.createdAt <= readBoundaryAt) return;

      const lastMarkedAt = lastMarkedAtRef.current;
      if (lastMarkedAt && message.createdAt <= lastMarkedAt) return;

      lastMarkedAtRef.current = message.createdAt;
      markRead({ roomId, messageId: message.id });
    },
    [roomId, markRead, readBoundaryAt]
  );

  const onJumpToLatest = useCallback(() => setIsJumpingToLatest(true), []);

  useEffect(() => {
    if (!isJumpingToLatest) return;

    if (hasNewer) {
      if (!isFetchingNewer) fetchNewer();
      return;
    }

    setIsJumpingToLatest(false);
    messageListRef.current?.scrollToBottom();
  }, [isJumpingToLatest, hasNewer, isFetchingNewer, fetchNewer]);

  const threadRoot = useMemo(
    () =>
      threadId
        ? allMessages.find((message) => message.id === threadId)
        : undefined,
    [allMessages, threadId]
  );

  const handleReact = useCallback(
    (message: ChatMessageItemType, emoji: string) => {
      toggleReaction.mutate({ messageId: message.id, emoji });
    },
    [toggleReaction.mutate]
  );

  const handleCancelReply = useCallback(() => setReplyTo(null), []);

  return (
    <ChatRoomContext.Provider
      value={{
        roomId,
        currentUserId: user.id,
        timezone: user.timezone,
        typingUserIds,
        onlineUserIds,
        replyTo,
        roomDetails,
        members: roomDetails.members,
        setReplyTo,
        onReact: handleReact,
        onReply: setReplyTo,
        onCancelReply: handleCancelReply,
        onActivity,
        allMessages,
        messageListRef,
        threadRoot,
        unreadLayout,
        onJumpToLatest,
        onMessageVisible,
      }}
    >
      {children}
    </ChatRoomContext.Provider>
  );
}

export function useChatRoomContext() {
  const context = useContext(ChatRoomContext);
  if (!context) {
    throw new Error("useChatRoomContext must be used within ChatRoomProvider");
  }
  return context;
}

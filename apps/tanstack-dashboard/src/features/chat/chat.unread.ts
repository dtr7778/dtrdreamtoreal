import type { ChatMessageItemType } from "@workspace/lib/chat";

import type { MessageCursorType } from "./chat.cursor";

export type UnreadLayout = {
  openAt: "top" | "divider" | "bottom";
  unreadDividerId: string | null;
  readBoundaryAt: Date | null;
};

type LoadedMessages = {
  pages: Array<{ items: Array<ChatMessageItemType> }>;
  pageParams: Array<MessageCursorType | null>;
};

/**
 * Derives the room's opening position from the anchored window.
 *
 * The anchored window starts at the last read message, so `items[0]` is the
 * read boundary and `items[1]` is the first unseen message. Messages after the
 * boundary count as unread; the boundary itself is already read.
 */
export function getUnreadLayout(
  messages: LoadedMessages,
  lastReadMessageId: string | null
): UnreadLayout {
  const anchorIndex = messages.pageParams.findIndex((param) => param?.anchor);
  const anchorParam = messages.pageParams[anchorIndex];

  if (anchorIndex < 0) {
    return { openAt: "bottom", unreadDividerId: null, readBoundaryAt: null };
  }

  if (anchorParam?.fromOldest) {
    return { openAt: "top", unreadDividerId: null, readBoundaryAt: null };
  }

  const [boundary, firstUnseen] = messages.pages[anchorIndex]?.items ?? [];
  const isBoundary =
    boundary !== undefined && boundary.id === lastReadMessageId;

  if (!isBoundary) {
    return { openAt: "bottom", unreadDividerId: null, readBoundaryAt: null };
  }

  const unreadDividerId = firstUnseen?.id ?? null;

  return {
    openAt: unreadDividerId ? "divider" : "bottom",
    unreadDividerId,
    readBoundaryAt: boundary.createdAt,
  };
}

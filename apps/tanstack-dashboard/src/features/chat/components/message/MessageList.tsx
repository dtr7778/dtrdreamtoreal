import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { MessagesSquare } from "lucide-react";

import type { ChatMessageItemType } from "@workspace/lib/chat";
import { Badge } from "@workspace/ui/components/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Spinner } from "@workspace/ui/components/spinner";
import { useAsRef } from "@workspace/ui/hooks/use-as-ref";
import { useIsomorphicLayoutEffect } from "@workspace/ui/hooks/use-isomorphic-layout-effect";

import { chatDayKey, formatMessageDay } from "../../chat.date";
import { useChatRoomContext } from "../room/ChatRoomProvider";
import { MessageBubble } from "./MessageBubble";

export type MessageListHandle = {
  scrollToBottom: () => void;
};

const VISIBLE_RATIO = 0.5;
const READ_DWELL_MS = 500;
const LOAD_OLDER_THRESHOLD_PX = 120;

type ListRow =
  | { kind: "divider"; key: string }
  | {
      kind: "message";
      key: string;
      message: ChatMessageItemType;
      newDay: boolean;
      isFirstInGroup: boolean;
      isLastInGroup: boolean;
    };

function buildRows(
  messages: Array<ChatMessageItemType>,
  timezone: string | null | undefined,
  unreadDividerId: string | null
): Array<ListRow> {
  const rows: Array<ListRow> = [];

  messages.forEach((message, index) => {
    const previous = messages[index - 1];
    const next = messages[index + 1];
    const newDay =
      !previous ||
      chatDayKey(previous.createdAt, timezone) !==
        chatDayKey(message.createdAt, timezone);
    const nextNewDay =
      !next ||
      chatDayKey(next.createdAt, timezone) !==
        chatDayKey(message.createdAt, timezone);

    if (message.id === unreadDividerId) {
      rows.push({ kind: "divider", key: "unread-divider" });
    }

    rows.push({
      kind: "message",
      key: message.id,
      message,
      newDay,
      isFirstInGroup:
        newDay || !previous || previous.sender.id !== message.sender.id,
      isLastInGroup:
        nextNewDay || !next || next.sender.id !== message.sender.id,
    });
  });

  return rows;
}

function UnreadDivider() {
  return (
    <div
      role="separator"
      aria-label="New messages"
      className="my-3 flex items-center gap-3"
    >
      <span className="h-px flex-1 bg-primary/40" aria-hidden="true" />
      <span className="text-xs font-medium text-primary">New messages</span>
      <span className="h-px flex-1 bg-primary/40" aria-hidden="true" />
    </div>
  );
}

export function MessageList({
  hasOlder,
  isFetchingOlder,
  onLoadOlder,
  onAtBottomChange,
}: {
  hasOlder: boolean;
  isFetchingOlder: boolean;
  onLoadOlder: () => void;
  onAtBottomChange?: (atBottom: boolean) => void;
}) {
  "use no memo";
  const {
    currentUserId,
    timezone,
    allMessages,
    messageListRef,
    unreadLayout,
    onMessageVisible,
  } = useChatRoomContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  const lastCountRef = useRef(allMessages.length);
  const lastNotifiedRef = useRef(true);
  const didInitialScrollRef = useRef(false);
  const prependAnchorRef = useRef<{ key: string; distance: number } | null>(
    null
  );
  const observerRef = useRef<IntersectionObserver | null>(null);
  const messagesByIdRef = useRef(new Map<string, ChatMessageItemType>());
  const visibleRef = useRef(new Map<string, ChatMessageItemType>());
  const readTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const onMessageVisibleRef = useAsRef(onMessageVisible);

  const rows = useMemo(
    () => buildRows(allMessages, timezone, unreadLayout.unreadDividerId),
    [allMessages, timezone, unreadLayout.unreadDividerId]
  );

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: (index) => (rows[index]?.kind === "divider" ? 40 : 96),
    getItemKey: (index) => rows[index]?.key ?? index,
    overscan: 8,
    paddingStart: 16,
    paddingEnd: 16,
  });

  const syncAtBottom = useCallback(
    (next: boolean) => {
      atBottomRef.current = next;
      if (lastNotifiedRef.current !== next) {
        lastNotifiedRef.current = next;
        onAtBottomChange?.(next);
      }
    },
    [onAtBottomChange]
  );

  const scrollToBottom = useCallback(() => {
    if (rows.length > 0) {
      virtualizer.scrollToIndex(rows.length - 1, { align: "end" });
    }
    syncAtBottom(true);
  }, [rows.length, virtualizer, syncAtBottom]);

  useImperativeHandle(messageListRef, () => ({ scrollToBottom }), [
    scrollToBottom,
  ]);

  useIsomorphicLayoutEffect(() => {
    if (didInitialScrollRef.current || rows.length === 0) return;
    didInitialScrollRef.current = true;

    if (unreadLayout.openAt === "top") {
      virtualizer.scrollToIndex(0, { align: "start" });
      return;
    }

    if (unreadLayout.openAt === "divider") {
      const dividerIndex = rows.findIndex((row) => row.kind === "divider");
      if (dividerIndex >= 0) {
        virtualizer.scrollToIndex(dividerIndex, { align: "start" });
        return;
      }
    }

    scrollToBottom();
  }, [rows, unreadLayout.openAt, virtualizer, scrollToBottom]);

  useIsomorphicLayoutEffect(() => {
    const anchor = prependAnchorRef.current;
    const el = containerRef.current;
    if (!anchor || !el) return;

    const index = rows.findIndex((row) => row.key === anchor.key);
    if (index < 0) return;

    prependAnchorRef.current = null;
    const offset = virtualizer.getOffsetForIndex(index, "start")?.[0];
    if (offset !== undefined) el.scrollTop = offset - anchor.distance;
  }, [rows, virtualizer]);

  useEffect(() => {
    const grew = allMessages.length > lastCountRef.current;
    lastCountRef.current = allMessages.length;

    if (grew && atBottomRef.current) {
      scrollToBottom();
    }
  }, [allMessages.length, scrollToBottom]);

  useEffect(() => {
    messagesByIdRef.current = new Map(
      allMessages.map((message) => [message.id, message])
    );
  }, [allMessages]);

  useEffect(
    () => () => {
      clearTimeout(readTimerRef.current);
      observerRef.current?.disconnect();
      observerRef.current = null;
    },
    []
  );

  useEffect(() => {
    const root = containerRef.current;
    if (!root) {
      observerRef.current?.disconnect();
      observerRef.current = null;
      return;
    }
    if (!onMessageVisibleRef.current) return;

    if (observerRef.current?.root !== root) {
      observerRef.current?.disconnect();
      observerRef.current = createReadObserver(root);
    }

    const observer = observerRef.current;
    root
      .querySelectorAll<HTMLElement>("[data-message-id]")
      .forEach((el) => observer?.observe(el));
  });

  function createReadObserver(root: HTMLElement) {
    return new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.messageId;
          if (!id) continue;

          const message = messagesByIdRef.current.get(id);
          if (
            entry.isIntersecting &&
            entry.intersectionRatio >= VISIBLE_RATIO &&
            message
          ) {
            visibleRef.current.set(id, message);
          } else {
            visibleRef.current.delete(id);
          }
        }

        clearTimeout(readTimerRef.current);
        readTimerRef.current = setTimeout(() => {
          let newest: ChatMessageItemType | undefined;
          for (const message of visibleRef.current.values()) {
            if (!newest || message.createdAt > newest.createdAt) {
              newest = message;
            }
          }
          if (newest) onMessageVisibleRef.current?.(newest);
        }, READ_DWELL_MS);
      },
      { root, threshold: VISIBLE_RATIO }
    );
  }

  function loadOlder() {
    const el = containerRef.current;
    const first = virtualizer.getVirtualItems()[0];
    if (el && first) {
      prependAnchorRef.current = {
        key: String(first.key),
        distance: first.start - el.scrollTop,
      };
    }
    onLoadOlder();
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !hasOlder || isFetchingOlder) return;

    if (virtualizer.getTotalSize() <= el.clientHeight) {
      loadOlder();
    }
  });

  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;

    syncAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80);

    if (
      el.scrollTop < LOAD_OLDER_THRESHOLD_PX &&
      hasOlder &&
      !isFetchingOlder
    ) {
      loadOlder();
    }
  }

  if (allMessages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessagesSquare aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No messages yet</EmptyTitle>
            <EmptyDescription>
              Start the conversation by sending the first message.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
    >
      <div
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {isFetchingOlder && (
          <div className="absolute inset-x-0 top-0 flex justify-center py-2">
            <Spinner className="size-4" aria-hidden="true" />
          </div>
        )}

        {virtualizer.getVirtualItems().map((item) => {
          const row = rows[item.index];
          if (!row) return null;

          return (
            <div
              key={item.key}
              data-index={item.index}
              data-message-id={
                row.kind === "message" ? row.message.id : undefined
              }
              ref={virtualizer.measureElement}
              className="absolute inset-x-0 top-0 px-3 sm:px-4"
              style={{ transform: `translateY(${item.start}px)` }}
            >
              {row.kind === "divider" ? (
                <UnreadDivider />
              ) : (
                <>
                  {row.newDay && (
                    <div className="my-3 flex justify-center">
                      <Badge
                        variant="secondary"
                        className="rounded-full px-3 text-[0.6875rem] font-normal text-muted-foreground"
                      >
                        {formatMessageDay(row.message.createdAt, timezone)}
                      </Badge>
                    </div>
                  )}

                  <MessageBubble
                    message={row.message}
                    isOwn={row.message.sender.id === currentUserId}
                    isFirstInGroup={row.isFirstInGroup}
                    isLastInGroup={row.isLastInGroup}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

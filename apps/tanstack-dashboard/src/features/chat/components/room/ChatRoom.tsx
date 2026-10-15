import { useState } from "react";

import { orpcTQClient } from "#/server/orpc";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { QueryStateBoundary } from "@workspace/ui/components/tanstack-query/query-state-boundary";

import { useChatMessagesQuery } from "../../api/chat.api.hook";
import type { RoomDetailsContractType } from "../../api/chat.contract";
import { unreadAnchorCursor } from "../../chat.cursor";
import { MessageComposer } from "../composer/MessageComposer";
import { MessageList } from "../message/MessageList";
import { ChatHeader } from "./ChatHeader";
import { ChatRoomProvider, useChatRoomContext } from "./ChatRoomProvider";
import { ThreadPanel } from "./ThreadPanel";

function ScrollToBottomButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      size="icon"
      variant="secondary"
      className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full shadow-md"
      onClick={onClick}
      aria-label="Scroll to latest messages"
    >
      <ArrowDown />
    </Button>
  );
}

export function ChatRoom({
  roomId,
  threadId,
}: {
  roomId: string;
  threadId?: string;
}) {
  "use no memo";
  const roomDetailsQuery = useQuery(
    orpcTQClient.chat.roomDetails.queryOptions({
      input: { roomId },
      select: (result) => result.data,
    })
  );

  return (
    <QueryStateBoundary
      data={roomDetailsQuery.data}
      isLoading={roomDetailsQuery.isLoading}
      isError={roomDetailsQuery.isError}
      error={roomDetailsQuery.error}
      isEmpty={() => false}
      loadingFallback={
        <div className="flex flex-1 items-center justify-center">
          <Spinner
            className="size-10 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      }
    >
      {(roomDetails) => (
        <ChatRoomMessages
          key={roomId}
          roomId={roomId}
          threadId={threadId}
          roomDetails={roomDetails}
        />
      )}
    </QueryStateBoundary>
  );
}

function ChatRoomMessages({
  roomId,
  threadId,
  roomDetails,
}: {
  roomId: string;
  threadId?: string;
  roomDetails: RoomDetailsContractType["output"]["data"];
}) {
  const [anchor] = useState(() =>
    unreadAnchorCursor(roomDetails.myMembership.lastReadMessageId)
  );
  const messagesQuery = useChatMessagesQuery({ roomId, anchor });

  return (
    <QueryStateBoundary
      data={messagesQuery.data}
      isLoading={messagesQuery.isLoading}
      isError={messagesQuery.isError}
      error={messagesQuery.error}
      isEmpty={() => false}
      loadingFallback={
        <div className="flex flex-1 items-center justify-center">
          <Spinner
            className="size-10 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      }
    >
      {(messagesData) => (
        <ChatRoomProvider
          roomId={roomId}
          messages={messagesData}
          roomDetails={roomDetails}
          threadId={threadId}
          hasNewer={messagesQuery.hasNextPage}
          isFetchingNewer={messagesQuery.isFetchingNextPage}
          fetchNewer={() => void messagesQuery.fetchNextPage()}
        >
          <ChatRoomView
            hasOlder={messagesQuery.hasPreviousPage}
            isFetchingOlder={messagesQuery.isFetchingPreviousPage}
            fetchOlder={() => void messagesQuery.fetchPreviousPage()}
          />
        </ChatRoomProvider>
      )}
    </QueryStateBoundary>
  );
}

function ChatRoomView({
  hasOlder,
  isFetchingOlder,
  fetchOlder,
}: {
  hasOlder: boolean;
  isFetchingOlder: boolean;
  fetchOlder: () => void;
}) {
  const {
    roomId,
    replyTo,
    onCancelReply,
    onActivity,
    onJumpToLatest,
    threadRoot,
  } = useChatRoomContext();

  const [isAtBottom, setIsAtBottom] = useState(true);

  return (
    <div className="relative flex min-h-0 flex-1">
      <section className="flex min-w-0 flex-1 flex-col bg-muted/30">
        <ChatHeader />

        <div className="relative flex min-h-0 flex-1 flex-col">
          <MessageList
            key={roomId}
            hasOlder={hasOlder}
            isFetchingOlder={isFetchingOlder}
            onLoadOlder={fetchOlder}
            onAtBottomChange={setIsAtBottom}
          />

          {!isAtBottom && <ScrollToBottomButton onClick={onJumpToLatest} />}
        </div>

        <MessageComposer
          replyTo={replyTo}
          onCancelReply={onCancelReply}
          onActivity={onActivity}
        />
      </section>
      <ThreadPanel rootMessage={threadRoot} />
    </div>
  );
}

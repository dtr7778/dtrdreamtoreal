import { resolveUserImage } from "#/utils/resolveUserImage";
import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";

import type { ChatMessageItemType } from "@workspace/lib/chat";
import { strInitials } from "@workspace/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { Spinner } from "@workspace/ui/components/spinner";
import { QueryStateBoundary } from "@workspace/ui/components/tanstack-query/query-state-boundary";

import { useChatMessagesQuery } from "../../api/chat.api.hook";
import { jsonToPlainPreview } from "../../chat.content";
import { formatMessageTime } from "../../chat.date";
import { MessageComposer } from "../composer/MessageComposer";
import { MessageList } from "../message/MessageList";
import { ChatRoomContext, useChatRoomContext } from "./ChatRoomProvider";

export function ThreadPanel({
  rootMessage,
}: {
  rootMessage: ChatMessageItemType | undefined;
}) {
  const nagivate = useNavigate({ from: "/chat/$chatRoomId" });
  const { roomId } = useChatRoomContext();

  const handleCloseThread = () => {
    nagivate({
      params: { chatRoomId: roomId },
      search: {
        threadId: undefined,
      },
    });
  };

  return (
    <Sheet
      open={Boolean(rootMessage)}
      onOpenChange={(open) => {
        if (!open) handleCloseThread();
      }}
    >
      <SheetContent
        side="right"
        showCloseButton={false}
        className="bg-background data-[side=right]:sm:max-w-lg"
      >
        {rootMessage && (
          <ThreadBody rootMessage={rootMessage} onClose={handleCloseThread} />
        )}
      </SheetContent>
    </Sheet>
  );
}

function ThreadBody({
  rootMessage,
  onClose,
}: {
  rootMessage: ChatMessageItemType;
  onClose: () => void;
}) {
  const context = useChatRoomContext();
  const { roomId, timezone } = context;

  const messagesQuery = useChatMessagesQuery({
    roomId,
    parentMessageId: rootMessage.id,
  });

  return (
    <>
      <header className="flex items-center justify-between gap-2 border-b px-3 py-2.5">
        <SheetTitle className="text-sm font-semibold">Thread</SheetTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close thread"
        >
          <X className="size-4" />
        </Button>
      </header>

      <div className="border-b bg-muted/30 px-3 py-2.5">
        <div className="flex items-start gap-2">
          <Avatar className="size-7 shrink-0">
            <AvatarImage
              src={resolveUserImage(rootMessage.sender.image)}
              alt=""
            />
            <AvatarFallback>
              {strInitials(rootMessage.sender.name ?? "?")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-xs font-semibold">
              {rootMessage.sender.name ?? "Unknown"}
              <span className="ms-1.5 font-normal text-muted-foreground">
                {formatMessageTime(rootMessage.createdAt, timezone)}
              </span>
            </p>
            <p className="text-xs whitespace-pre-wrap text-muted-foreground">
              {jsonToPlainPreview(rootMessage.body) || "Attachment"}
            </p>
          </div>
        </div>
        <p className="mt-2 text-[0.6875rem] font-medium text-muted-foreground">
          {rootMessage.threadReplyCount}{" "}
          {rootMessage.threadReplyCount === 1 ? "reply" : "replies"}
        </p>
      </div>

      <Separator />

      <QueryStateBoundary
        data={messagesQuery.data}
        isLoading={messagesQuery.isLoading}
        isError={messagesQuery.isError}
        error={messagesQuery.error}
        isEmpty={() => false}
        loadingFallback={
          <div className="flex flex-1 items-center justify-center">
            <Spinner className="size-5" aria-hidden="true" />
          </div>
        }
      >
        {(messagesData) => (
          <ChatRoomContext.Provider
            value={{
              ...context,
              replyTo: null,
              onReply: () => undefined,
              allMessages: messagesData.pages.flatMap((page) => page.items),
              unreadLayout: {
                openAt: "bottom",
                unreadDividerId: null,
                readBoundaryAt: null,
              },
              onJumpToLatest: () => undefined,
              onMessageVisible: undefined,
            }}
          >
            <MessageList
              hasOlder={Boolean(messagesQuery.hasPreviousPage)}
              isFetchingOlder={messagesQuery.isFetchingPreviousPage}
              onLoadOlder={() => void messagesQuery.fetchPreviousPage()}
            />
          </ChatRoomContext.Provider>
        )}
      </QueryStateBoundary>

      <MessageComposer parentMessageId={rootMessage.id} />
    </>
  );
}

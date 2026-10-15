import { useState } from "react";

import { chatMessagesPageOptions } from "#/features/chat/api/chat.api.hook";
import { unreadAnchorCursor } from "#/features/chat/chat.cursor";
import { ChatGroupCreateDialog } from "#/features/chat/components/dialogs/ChatGroupCreateDialog";
import { ChatRoomCreateDialog } from "#/features/chat/components/dialogs/ChatRoomCreateDialog";
import { ChatRoom } from "#/features/chat/components/room/ChatRoom";
import { orpcTQClient } from "#/server/orpc";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AlertCircle, AtSign, MessagesSquare, SearchX } from "lucide-react";
import z from "zod";

import { Button } from "@workspace/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { cn } from "@workspace/ui/lib/utils";

export const Route = createFileRoute(
  "/(dashboard)/_dashboardLayout/chat/_chatLayout/$chatRoomId"
)({
  validateSearch: z.object({
    threadId: z.uuid().optional(),
  }),
  loader: async ({ context: { queryClient }, params: { chatRoomId } }) => {
    await queryClient.query(
      orpcTQClient.chat.roomDetails.queryOptions({
        input: { roomId: chatRoomId },
      })
    );
    const room = queryClient.getQueryData(
      orpcTQClient.chat.roomDetails.queryKey({
        input: { roomId: chatRoomId },
      })
    );
    await queryClient.infiniteQuery(
      chatMessagesPageOptions({
        roomId: chatRoomId,
        anchor: unreadAnchorCursor(
          room?.data.myMembership.lastReadMessageId ?? null
        ),
      })
    );
  },
  pendingComponent: ChatRoomSkeleton,
  notFoundComponent: ChatRoomNotFound,
  errorComponent: ChatRoomError,
  component: RouteComponent,
});

function RouteComponent() {
  const { chatRoomId } = Route.useParams();
  const { threadId } = Route.useSearch();

  return <ChatRoom roomId={chatRoomId} threadId={threadId} />;
}

function ChatRoomError({ error }: { error: unknown }) {
  const router = useRouter();
  const message =
    error instanceof Error ? error.message : "Something went wrong.";

  return (
    <div
      role="alert"
      className="flex flex-1 flex-col items-center justify-center gap-3 bg-muted/30 p-8 text-center"
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="size-7 text-destructive" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold">Couldn’t load conversation</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" onClick={() => void router.invalidate()}>
        Try again
      </Button>
    </div>
  );
}

function ChatRoomSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-muted/30">
      <header className="flex items-center gap-3 border-b bg-background px-3 py-2.5">
        <Skeleton className="size-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "flex",
              index % 2 === 0 ? "justify-start" : "justify-end"
            )}
          >
            <Skeleton
              className={cn(
                "h-10 rounded-2xl",
                index % 2 === 0 ? "w-1/2" : "w-2/5"
              )}
            />
          </div>
        ))}
      </div>

      <div className="border-t bg-background p-3">
        <Skeleton className="h-10 w-full rounded-2xl" />
      </div>
    </div>
  );
}

function ChatRoomNotFound() {
  const [openConvDialog, setOpenConvDialog] = useState<boolean>(false);
  const [openGroupDialog, setOpenGroupDialog] = useState<boolean>(false);

  return (
    <div className="flex flex-1 items-center justify-center bg-muted/30 p-8">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Conversation not found</EmptyTitle>
          <EmptyDescription>
            This conversation doesn’t exist or you no longer have access to it.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-2">
          <Button onClick={() => setOpenConvDialog(true)}>
            <AtSign />
            <span>New Conversation</span>
          </Button>
          <Button variant="outline" onClick={() => setOpenGroupDialog(true)}>
            <MessagesSquare />
            <span>Create Group</span>
          </Button>
        </EmptyContent>
      </Empty>

      <ChatRoomCreateDialog open={openConvDialog} setOpen={setOpenConvDialog} />
      <ChatGroupCreateDialog
        open={openGroupDialog}
        setOpen={setOpenGroupDialog}
      />
    </div>
  );
}

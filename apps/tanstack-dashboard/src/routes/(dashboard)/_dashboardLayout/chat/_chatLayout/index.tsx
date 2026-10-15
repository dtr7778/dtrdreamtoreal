import { useState } from "react";

import { ChatGroupCreateDialog } from "#/features/chat/components/dialogs/ChatGroupCreateDialog";
import { ChatRoomCreateDialog } from "#/features/chat/components/dialogs/ChatRoomCreateDialog";
import { createFileRoute } from "@tanstack/react-router";
import { AtSign, MessagesSquare } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";

export const Route = createFileRoute(
  "/(dashboard)/_dashboardLayout/chat/_chatLayout/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const [openConvDialog, setOpenConvDialog] = useState<boolean>(false);
  const [openGroupDialog, setOpenGroupDialog] = useState<boolean>(false);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-muted/30">
      <div className="flex flex-1 items-center justify-center p-8">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessagesSquare aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Your messages</EmptyTitle>
            <EmptyDescription>
              Select a conversation from the list to start messaging.
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

        <ChatRoomCreateDialog
          open={openConvDialog}
          setOpen={setOpenConvDialog}
        />
        <ChatGroupCreateDialog
          open={openGroupDialog}
          setOpen={setOpenGroupDialog}
        />
      </div>
    </div>
  );
}

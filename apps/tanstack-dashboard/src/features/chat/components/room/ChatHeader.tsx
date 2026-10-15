import { resolveUserImage } from "#/utils/resolveUserImage";

import { strInitials } from "@workspace/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { SidebarTrigger } from "@workspace/ui/components/sidebar";

import { ChatRoomDetailsSheet } from "./ChatRoomDetailsSheet";
import { useChatRoomContext } from "./ChatRoomProvider";

export function ChatHeader() {
  const { currentUserId, typingUserIds, onlineUserIds, roomDetails } =
    useChatRoomContext();

  const otherMember =
    roomDetails.type === "direct"
      ? roomDetails.members.find((member) => member.userId !== currentUserId)
      : undefined;

  const typingNames = typingUserIds
    .filter((id) => id !== currentUserId)
    .map(
      (id) =>
        roomDetails.members.find((member) => member.userId === id)?.name ??
        "Someone"
    );

  const otherOnline = otherMember
    ? onlineUserIds.includes(otherMember.userId)
    : false;

  const subtitle =
    typingNames.length > 0
      ? `${typingNames.slice(0, 2).join(", ")} ${typingNames.length > 1 ? "are" : "is"} typing…`
      : roomDetails.type === "direct"
        ? otherOnline
          ? "Online"
          : "Direct message"
        : `${roomDetails.members.length} member${roomDetails.members.length === 1 ? "" : "s"}`;

  return (
    <header className="flex items-center gap-2 border-b bg-background px-2.5 py-2">
      <SidebarTrigger />
      <div className="flex flex-1 items-center gap-2">
        <div className="relative shrink-0">
          <Avatar className="size-8">
            <AvatarImage
              src={
                roomDetails.type === "direct"
                  ? resolveUserImage(roomDetails.displayImage)
                  : roomDetails.displayImage
                    ? roomDetails.displayImage
                    : undefined
              }
              alt=""
            />
            <AvatarFallback>
              {strInitials(roomDetails.displayName)}
            </AvatarFallback>
          </Avatar>
          {otherOnline && (
            <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-background bg-emerald-500" />
          )}
        </div>

        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold">
            {roomDetails.displayName}
          </p>
          <p
            className="truncate text-xs text-muted-foreground"
            aria-live="polite"
          >
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center">
        <ChatRoomDetailsSheet />
      </div>
    </header>
  );
}

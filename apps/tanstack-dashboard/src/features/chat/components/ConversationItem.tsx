import { useAuthStore } from "#/stores/zustand/auth/AuthStoreContext";
import { resolveUserImage } from "#/utils/resolveUserImage";
import { Link } from "@tanstack/react-router";
import { BellOff } from "lucide-react";

import { strInitials } from "@workspace/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import { cn } from "@workspace/ui/lib/utils";

import type { ListConversationContractType } from "../api/chat.contract";
import { jsonToPlainPreview } from "../chat.content";
import { formatConversationTime } from "../chat.date";

export function ConversationItem({
  conversation,
}: {
  conversation: ListConversationContractType["output"]["data"][number];
}) {
  const user = useAuthStore((state) => state.user);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className="h-16"
        render={
          <Link
            to="/chat/$chatRoomId"
            params={{ chatRoomId: conversation.roomId }}
            activeProps={{
              "data-active": "true",
            }}
          />
        }
      >
        <Avatar className="size-10 shrink-0">
          <AvatarImage
            src={
              conversation.type === "direct"
                ? resolveUserImage(conversation.displayImage)
                : conversation.displayImage
                  ? conversation.displayImage
                  : undefined
            }
            alt={conversation.displayName}
          />
          <AvatarFallback>
            {strInitials(conversation.displayName)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <p className="truncate text-sm font-semibold">
                {conversation.displayName}
              </p>
              {conversation.isMuted && (
                <BellOff
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-label="Notifications muted"
                />
              )}
            </div>
            {conversation.lastMessage && (
              <span
                className={cn(
                  "shrink-0 text-xs text-muted-foreground",
                  conversation.unreadCount > 0 && "font-semibold"
                )}
              >
                {formatConversationTime(
                  conversation.lastMessage.createdAt,
                  user.timezone
                )}
              </span>
            )}
          </div>

          <div className="flex">
            <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
              {conversation.lastMessage
                ? `${conversation.lastMessage.senderName ?? "Unknown"}: ${jsonToPlainPreview(conversation.lastMessage.body) || "Attachment"}`
                : "No messages yet"}
            </p>
            {conversation.unreadCount > 0 && (
              <Badge
                role="status"
                aria-atomic="true"
                aria-label={`${conversation.unreadCount} unread messages`}
                className="min-w-5 shrink-0 justify-center rounded-full"
              >
                {conversation.unreadCount > 99
                  ? "99+"
                  : conversation.unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

import { useState } from "react";

import { DeleteDialog } from "#/components/DeleteDialog";
import { useAuthStore } from "#/stores/zustand/auth/AuthStoreContext";
import { resolveUserImage } from "#/utils/resolveUserImage";
import { useNavigate } from "@tanstack/react-router";
import { Bell, BellOff, Ellipsis, SquarePen, Trash2 } from "lucide-react";

import { formatDateWithTimezone, strInitials } from "@workspace/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";

import { useDeleteGroup, useSetRoomMute } from "../../api/chat.api.hook";
import { ChatGroupUpdateDialog } from "../dialogs/ChatGroupUpdateDialog";
import { useChatRoomContext } from "./ChatRoomProvider";

export function ChatRoomDetailsSheet() {
  const user = useAuthStore((state) => state.user);
  const { onlineUserIds, roomDetails } = useChatRoomContext();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const deleteGroup = useDeleteGroup({
    onSuccess: () => {
      setDeleteOpen(false);
      navigate({ to: "/chat" });
    },
  });

  const setRoomMute = useSetRoomMute(roomDetails.id, user.id);

  const canEdit =
    roomDetails.type === "group" &&
    (roomDetails.myMembership.role === "owner" ||
      roomDetails.myMembership.role === "admin");

  const canDelete =
    roomDetails.type === "group" && roomDetails.myMembership.role === "owner";

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="View room details" />
        }
      >
        <Ellipsis />
      </SheetTrigger>
      <SheetContent side="right" className="data-[side=right]:sm:max-w-md">
        <SheetHeader className="border-b">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 shrink-0">
              <AvatarImage
                src={
                  roomDetails.type === "direct"
                    ? resolveUserImage(roomDetails.displayImage)
                    : roomDetails.displayImage
                      ? roomDetails.displayImage
                      : undefined
                }
                alt={roomDetails.displayName}
              />
              <AvatarFallback>
                {strInitials(roomDetails.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 pe-8">
              <SheetTitle className="truncate">
                {roomDetails.displayName}
              </SheetTitle>
              <SheetDescription className="truncate">
                {roomDetails.type === "direct"
                  ? "Direct message"
                  : `Group · ${roomDetails.members.length} member${roomDetails.members.length === 1 ? "" : "s"}`}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <section className="space-y-2 p-4">
            <h3 className="font-medium text-foreground">Details</h3>
            <dl className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Type</dt>
                <dd>
                  <Badge variant="secondary" className="capitalize">
                    {roomDetails.type}
                  </Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Your role</dt>
                <dd className="capitalize">{roomDetails.myMembership.role}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Notifications</dt>
                <dd>{roomDetails.myMembership.isMuted ? "Muted" : "On"}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Created</dt>
                <dd>
                  {formatDateWithTimezone(
                    roomDetails.createdAt,
                    "PP",
                    user?.timezone
                  )}
                </dd>
              </div>
              {roomDetails.isArchived && (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <Badge variant="secondary">Archived</Badge>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <Separator />

          <section className="space-y-2 p-4">
            <h3 className="flex items-center gap-2 font-medium text-foreground">
              Members
              <Badge variant="secondary">{roomDetails.members.length}</Badge>
            </h3>
            <ul className="space-y-0.5">
              {roomDetails.members.map((member) => {
                const isOnline = onlineUserIds.includes(member.userId);
                return (
                  <li
                    key={member.userId}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
                  >
                    <span className="relative shrink-0">
                      <Avatar className="size-7">
                        <AvatarImage src={member.image ?? undefined} alt="" />
                        <AvatarFallback>
                          {strInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      {isOnline && (
                        <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-popover bg-emerald-500" />
                      )}
                    </span>
                    <span className="min-w-0 flex gap-1 flex-1 truncate text-sm">
                      <span>{member.name}</span>
                      {member.userId === user.id && (
                        <span className="text-muted-foreground">(you)</span>
                      )}
                    </span>
                    <span className="text-[0.625rem] text-muted-foreground uppercase">
                      {member.role}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <SheetFooter className="">
          <Button
            type="button"
            variant="outline"
            disabled={setRoomMute.isPending}
            onClick={() =>
              setRoomMute.mutate({
                roomId: roomDetails.id,
                isMuted: !roomDetails.myMembership.isMuted,
              })
            }
          >
            {roomDetails.myMembership.isMuted ? <Bell /> : <BellOff />}
            <span>
              {roomDetails.myMembership.isMuted
                ? "Unmute notifications"
                : "Mute notifications"}
            </span>
          </Button>
          <div className="flex gap-2">
            {canEdit && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setEditOpen(true)}
              >
                <SquarePen />
                <span>Edit group</span>
              </Button>
            )}
            {canDelete && (
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 />
                <span>Delete group</span>
              </Button>
            )}
          </div>
        </SheetFooter>
        {canEdit && (
          <ChatGroupUpdateDialog
            roomId={roomDetails.id}
            open={editOpen}
            onOpenChange={setEditOpen}
          />
        )}
        {canDelete && (
          <DeleteDialog
            openDeleteDialog={deleteOpen}
            setOpenDeleteDialog={setDeleteOpen}
            onDelete={() => deleteGroup.mutate({ roomId: roomDetails.id })}
            isDisable={deleteGroup.isPending}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

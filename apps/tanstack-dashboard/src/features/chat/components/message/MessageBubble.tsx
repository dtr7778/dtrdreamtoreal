import { resolveUserImage } from "#/utils/resolveUserImage";
import { useNavigate } from "@tanstack/react-router";
import { Reply, SmilePlus } from "lucide-react";

import type { ChatMessageItemType } from "@workspace/lib/chat";
import { strInitials } from "@workspace/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  Bubble,
  BubbleContent,
  BubbleReactions,
} from "@workspace/ui/components/bubble";
import { Button } from "@workspace/ui/components/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@workspace/ui/components/hover-card";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@workspace/ui/components/message";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";

import { CHAT_EMOJIS } from "../../chat.constants";
import { jsonToPlainPreview } from "../../chat.content";
import { formatMessageTime } from "../../chat.date";
import { useChatRoomContext } from "../room/ChatRoomProvider";
import { MessageAttachments } from "./MessageAttachments";
import { MessageBody } from "./MessageBody";

function ReplyQuote({
  replyTo,
}: {
  replyTo: NonNullable<ChatMessageItemType["replyTo"]>;
}) {
  return (
    <div className="mb-1 flex min-w-0 flex-col gap-0.5 rounded-md border-s-2 border-current/40 bg-foreground/5 px-2 py-1">
      <span className="text-[0.625rem] font-semibold opacity-80">
        {replyTo.senderName ?? "Unknown"}
      </span>
      <span className="truncate text-[0.6875rem] opacity-70">
        {jsonToPlainPreview(replyTo.body) || "Attachment"}
      </span>
    </div>
  );
}

function MessageActions({
  message,
  isOwn,
}: {
  message: ChatMessageItemType;
  isOwn: boolean;
}) {
  const canThread = !message.parentMessageId;
  const { onReact, onReply } = useChatRoomContext();
  const nagivate = useNavigate({ from: "/chat/$chatRoomId" });

  return (
    <div className={cn("flex items-center", isOwn && "flex-row-reverse")}>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Add reaction"
            />
          }
        >
          <SmilePlus aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent align="center" className="w-auto p-1">
          <div className="grid grid-cols-5 gap-0.5">
            {CHAT_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onReact(message, emoji)}
                className="flex size-8 items-center justify-center rounded-md text-base transition-colors hover:bg-muted"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <div className="flex items-center">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Reply"
          onClick={() => onReply(message)}
        >
          <Reply className="size-3.5" aria-hidden="true" />
        </Button>

        {canThread && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Reply in thread"
            onClick={() =>
              nagivate({
                params: { chatRoomId: message.roomId },
                search: {
                  threadId: message.id,
                },
              })
            }
          >
            <Reply className="size-3.5 -scale-x-100" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function MessageBubble({
  message,
  isOwn,
  isFirstInGroup,
  isLastInGroup,
}: {
  message: ChatMessageItemType;
  isOwn: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
}) {
  const { timezone, onReact } = useChatRoomContext();
  const { sender } = message;

  return (
    <Message
      align={isOwn ? "end" : "start"}
      className={isFirstInGroup ? "mt-3" : "mt-0.5"}
    >
      {!isOwn && (
        <MessageAvatar>
          {isLastInGroup && (
            <Avatar className="size-8">
              <AvatarImage src={resolveUserImage(sender.image)} alt="" />
              <AvatarFallback>{strInitials(sender.name ?? "?")}</AvatarFallback>
            </Avatar>
          )}
        </MessageAvatar>
      )}

      <MessageContent>
        {!isOwn && isFirstInGroup && (
          <MessageHeader>
            <span className="truncate">{sender.name ?? "Unknown"}</span>
          </MessageHeader>
        )}

        <HoverCard>
          <HoverCardTrigger
            delay={50}
            closeDelay={100}
            render={<Bubble variant="muted" align={isOwn ? "end" : "start"} />}
          >
            <BubbleContent>
              {message.replyTo && <ReplyQuote replyTo={message.replyTo} />}
              {message.body && <MessageBody doc={message.body} />}
              {message.attachments.length > 0 && (
                <MessageAttachments
                  attachments={message.attachments}
                  className="mt-1"
                />
              )}
            </BubbleContent>

            {message.reactions.length > 0 && (
              <BubbleReactions align={isOwn ? "start" : "end"}>
                {message.reactions.map((reaction) => (
                  <button
                    key={reaction.emoji}
                    type="button"
                    onClick={() => onReact(message, reaction.emoji)}
                    aria-pressed={reaction.reactedByMe}
                    aria-label={`${reaction.emoji} reaction, ${reaction.count}`}
                    className="flex items-center gap-0.5 rounded-full px-1 text-xs transition-colors hover:bg-background/70"
                  >
                    <span>{reaction.emoji}</span>
                    <span className="tabular-nums">{reaction.count}</span>
                  </button>
                ))}
              </BubbleReactions>
            )}
          </HoverCardTrigger>

          <HoverCardContent
            className="w-fit p-0 bg-transparent shadow-none border-none rounded-none ring-0"
            side={isOwn ? "left" : "right"}
            align="center"
          >
            <MessageActions message={message} isOwn={isOwn} />
          </HoverCardContent>
        </HoverCard>

        <MessageFooter>
          <span>{formatMessageTime(message.createdAt, timezone)}</span>
          {message.editedAt && <span>·</span>}
          {message.editedAt && <span>edited</span>}
        </MessageFooter>
      </MessageContent>
    </Message>
  );
}

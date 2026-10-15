import { useEffect, useRef, useState } from "react";

import { useFileUploadToAPI } from "#/features/upload/hook/useFileUploadToAPI";
import { EditorContent } from "@tiptap/react";
import { ArrowUp, X } from "lucide-react";
import toast from "react-hot-toast";

import type { ChatMessageItemType } from "@workspace/lib/chat";
import type { TiptapDoc } from "@workspace/lib/tiptap";
import {
  getBlockedFileError,
  MAX_UPLOAD_SIZE_BYTES,
} from "@workspace/lib/upload";
import { formatBytes } from "@workspace/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/lib/utils";

import { useSendMessage } from "../../api/chat.api.hook";
import {
  CHAT_MAX_ATTACHMENTS,
  CHAT_MESSAGE_MAX_LENGTH,
} from "../../chat.constants";
import { jsonToPlainPreview } from "../../chat.content";
import { useChatRoomContext } from "../room/ChatRoomProvider";
import { ComposerToolbar } from "./ComposerToolbar";
import { useMessageEditor } from "./useMessageEditor";

type PendingAttachment = {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
};

export function MessageComposer({
  parentMessageId = undefined,
  replyTo,
  sendOnEnter = true,
  onCancelReply,
  onActivity,
  autoFocus = false,
}: {
  parentMessageId?: string | undefined;
  replyTo?: ChatMessageItemType | null;
  sendOnEnter?: boolean;
  onCancelReply?: () => void;
  onActivity?: () => void;
  autoFocus?: boolean;
}) {
  const { roomId, members, currentUserId, onJumpToLatest } =
    useChatRoomContext();
  const [attachments, setAttachments] = useState<Array<PendingAttachment>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<() => void>(() => undefined);

  const uploadFile = useFileUploadToAPI();

  async function handleFiles(fileList: FileList | Array<File> | null) {
    if (!fileList) return;

    const files = Array.isArray(fileList) ? fileList : Array.from(fileList);
    if (files.length === 0) return;

    const acceptedFiles: Array<File> = [];
    for (const file of files) {
      const error =
        getBlockedFileError(file.name) ??
        (file.size > MAX_UPLOAD_SIZE_BYTES
          ? `"${file.name}" exceeds the maximum size of ${formatBytes(MAX_UPLOAD_SIZE_BYTES)}.`
          : null);

      if (error) {
        toast.error(error);
      } else {
        acceptedFiles.push(file);
      }
    }

    if (acceptedFiles.length === 0) return;

    if (attachments.length + acceptedFiles.length > CHAT_MAX_ATTACHMENTS) {
      toast.error(
        `You can attach up to ${CHAT_MAX_ATTACHMENTS} files per message.`
      );
      return;
    }

    setIsUploading(true);

    try {
      for (const file of acceptedFiles) {
        try {
          uploadFile.mutate(
            {
              file,
              entityType: "chat_message",
              scope: "chat",
            },
            {
              onSuccess: ({ data }) => {
                setAttachments((prev) => [
                  ...prev,
                  {
                    id: data.id,
                    filename: data.filename,
                    mimeType: data.mimeType,
                    size: data.size,
                    url: data.url,
                  },
                ]);
              },
            }
          );
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Failed to upload file."
          );
        }
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const { editor, characterCount } = useMessageEditor({
    members,
    currentUserId,
    placeholder: "Type a message",
    sendOnEnter,
    onSubmit: () => submitRef.current(),
    onFiles: (files) => void handleFiles(files),
    onActivity,
  });

  const sendMessage = useSendMessage({
    roomId,
    parentMessageId,
    onSuccess: () => {
      editor?.commands.clearContent(true);
      setAttachments([]);
      onCancelReply?.();
      onJumpToLatest();
      editor?.commands.focus();
    },
  });

  function submit() {
    if (!editor) return;
    if (
      sendMessage.isPending ||
      isUploading ||
      characterCount > CHAT_MESSAGE_MAX_LENGTH
    ) {
      return;
    }

    const hasText = editor.getText().trim().length > 0;
    const body = hasText ? (editor.getJSON() as TiptapDoc) : undefined;
    if (!hasText && attachments.length === 0) return;

    sendMessage.mutate({
      roomId,
      body,
      fileIds: attachments.length
        ? attachments.map((attachment) => attachment.id)
        : undefined,
      parentMessageId: parentMessageId ?? undefined,
      replyToMessageId: replyTo?.id ?? undefined,
    });
  }

  submitRef.current = submit;

  useEffect(() => {
    if (autoFocus) editor?.commands.focus();
  }, [autoFocus, editor]);

  const isOverLimit = characterCount > CHAT_MESSAGE_MAX_LENGTH;
  const hasText = (editor?.getText().trim().length ?? 0) > 0;

  const canSend =
    (hasText || attachments.length > 0) &&
    !sendMessage.isPending &&
    !isUploading &&
    !isOverLimit;

  return (
    <div className="border-t bg-background p-3">
      {replyTo && (
        <div className="mb-2 flex items-center justify-between gap-2 rounded-md border bg-muted/40 px-2 py-1 text-xs">
          <div className="space-y-1 min-w-0">
            <div className="font-semibold">
              {`Replying to ${replyTo.sender.name ?? "Unknown"}`}
            </div>
            <div className="text-xs font-normal">
              {jsonToPlainPreview(replyTo.body) || "Attachment"}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label="Cancel reply"
            onClick={onCancelReply}
          >
            <X />
          </Button>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-1.5 rounded-lg border bg-muted/40 px-2 py-1 text-xs"
            >
              <span className="max-w-40 truncate">{attachment.filename}</span>
              <span className="text-muted-foreground">
                {formatBytes(attachment.size)}
              </span>
              <button
                type="button"
                aria-label={`Remove ${attachment.filename}`}
                onClick={() =>
                  setAttachments((prev) =>
                    prev.filter((item) => item.id !== attachment.id)
                  )
                }
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-md border bg-secondary/60 focus-within:ring-2 focus-within:ring-ring/40">
        <div className="border-b p-1">
          <ComposerToolbar editor={editor} />
        </div>

        <div className="flex items-end gap-1 p-1">
          <EditorContent
            editor={editor}
            className="min-w-0 flex-1"
            onDragOver={(event) => event.preventDefault()}
          />

          <span
            className={cn(
              "shrink-0 pb-1.5 text-[0.625rem] tabular-nums",
              isOverLimit ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {characterCount}/{CHAT_MESSAGE_MAX_LENGTH}
          </span>

          <Button
            size="icon-lg"
            className="shrink-0"
            onClick={submit}
            disabled={!canSend}
            aria-label="Send message"
          >
            {sendMessage.isPending ? <Spinner /> : <ArrowUp />}
          </Button>
        </div>
      </div>
    </div>
  );
}

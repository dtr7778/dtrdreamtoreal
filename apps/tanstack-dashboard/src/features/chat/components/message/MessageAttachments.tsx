import { FileIcon } from "lucide-react";

import type { ChatAttachmentType } from "@workspace/lib/chat";
import { formatBytes } from "@workspace/lib/utils";
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@workspace/ui/components/attachment";
import { cn } from "@workspace/ui/lib/utils";

function isImage(mimeType: string) {
  return mimeType.startsWith("image/");
}

function AttachmentImage({ attachment }: { attachment: ChatAttachmentType }) {
  return (
    <Attachment orientation="vertical" className="w-full">
      <AttachmentMedia variant="image" className="w-full">
        <img src={attachment.url} alt={attachment.filename} loading="lazy" />
      </AttachmentMedia>
      <AttachmentTrigger
        render={
          <a
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            aria-label={attachment.filename}
          />
        }
      />
    </Attachment>
  );
}

function AttachmentFile({ attachment }: { attachment: ChatAttachmentType }) {
  return (
    <Attachment orientation="horizontal" className="w-full">
      <AttachmentMedia>
        <FileIcon aria-hidden="true" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{attachment.filename}</AttachmentTitle>
        <AttachmentDescription>
          {formatBytes(attachment.size)}
        </AttachmentDescription>
      </AttachmentContent>
      <AttachmentTrigger
        render={
          <a
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            aria-label={attachment.filename}
          />
        }
      />
    </Attachment>
  );
}

export function MessageAttachments({
  attachments,
  className,
}: {
  attachments: Array<ChatAttachmentType>;
  className?: string;
}) {
  if (attachments.length === 0) return null;

  const images = attachments.filter((attachment) =>
    isImage(attachment.mimeType)
  );
  const files = attachments.filter(
    (attachment) => !isImage(attachment.mimeType)
  );

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {images.length > 0 && (
        <div
          className={cn(
            "grid gap-1.5",
            images.length > 1 ? "grid-cols-2" : "grid-cols-1"
          )}
        >
          {images.map((attachment) => (
            <AttachmentImage key={attachment.id} attachment={attachment} />
          ))}
        </div>
      )}

      {files.map((attachment) => (
        <AttachmentFile key={attachment.id} attachment={attachment} />
      ))}
    </div>
  );
}

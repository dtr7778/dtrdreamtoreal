"use client";

import { Sparkles } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Spinner } from "@workspace/ui/components/spinner";

interface AiDescriptionPreviewProps {
  preview: string;
  isStreaming: boolean;
  isStreamingCompleted: boolean;
}

export function AiDescriptionPreview({
  preview,
  isStreaming,
  isStreamingCompleted,
}: AiDescriptionPreviewProps) {
  if (!preview && !isStreaming) {
    return (
      <Empty className="border bg-muted/20 py-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Sparkles />
          </EmptyMedia>
          <EmptyTitle>No description yet</EmptyTitle>
          <EmptyDescription>
            Generate a draft from your briefing, or skip and write it yourself.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (isStreaming && !preview) {
    return (
      <Card size="sm" className="gap-3 border bg-muted/20 ring-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="size-3.5" />
            AI suggestion
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Spinner size={10} />
              Generating
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card size="sm" className="gap-3 border bg-muted/20 ring-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-primary" />
          AI suggestion
        </CardTitle>
        <CardAction>
          {isStreaming ? (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Spinner size={10} />
              Generating
            </Badge>
          ) : isStreamingCompleted ? (
            <Badge variant="secondary">Ready to use</Badge>
          ) : null}
        </CardAction>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-48">
          <p
            className="whitespace-pre-wrap pe-3 text-sm leading-relaxed text-foreground/90"
            aria-live="polite"
            aria-busy={isStreaming}
          >
            {preview}
            {isStreaming && (
              <span
                aria-hidden
                className="ms-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse rounded-sm bg-primary motion-reduce:animate-none"
              />
            )}
          </p>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
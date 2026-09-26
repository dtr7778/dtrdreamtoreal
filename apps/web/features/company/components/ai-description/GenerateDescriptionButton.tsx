"use client";

import { CircleStop, RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/lib/utils";

interface GenerateDescriptionButtonProps {
  isStreaming: boolean;
  isStreamingCompleted: boolean;
  onGenerate: () => void;
  onStop: () => void;
  className?: string;
}

export function GenerateDescriptionButton({
  isStreaming,
  isStreamingCompleted,
  onGenerate,
  onStop,
  className,
}: GenerateDescriptionButtonProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center",
        className
      )}
    >
      {isStreaming && (
        <Button
          type="button"
          variant="outline"
          className="sm:w-fit"
          onClick={onStop}
        >
          <CircleStop className="size-4" />
          <span>Stop</span>
        </Button>
      )}

      <Button
        type="button"
        variant={isStreamingCompleted ? "outline" : "default"}
        className="sm:w-fit"
        disabled={isStreaming}
        onClick={onGenerate}
      >
        {isStreaming ? (
          <Spinner />
        ) : isStreamingCompleted ? (
          <RefreshCw className="size-4" />
        ) : (
          <Sparkles className="size-4" />
        )}
        <span>
          {isStreaming
            ? "Generating description..."
            : isStreamingCompleted
              ? "Regenerate description"
              : "Generate description with AI"}
        </span>
      </Button>
    </div>
  );
}
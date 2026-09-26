"use client";

import { CircleStop, RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";

import { useCompanyDescriptionContext } from "../contexts/CompanyDescriptionContext";

export function GenerateDescriptionButton() {
  "use no memo";

  const {
    isStreaming,
    generateDescription,
    stopGeneratingDescription,
    isStreamingCompleted,
  } = useCompanyDescriptionContext();

  return (
    <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center">
      {isStreaming && (
        <Button
          type="button"
          variant="outline"
          className="sm:w-fit"
          onClick={stopGeneratingDescription}
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
        onClick={generateDescription}
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

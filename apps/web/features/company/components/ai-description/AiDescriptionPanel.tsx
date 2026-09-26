"use client";

import { AiUsageType } from "@/features/company/company.schema";

import { AiDescriptionPreview } from "./AiDescriptionPreview";
import { DescriptionUsage } from "./DescriptionUsage";
import { GenerateDescriptionButton } from "./GenerateDescriptionButton";

interface AiDescriptionPanelProps {
  preview: string;
  isStreaming: boolean;
  isStreamingCompleted: boolean;
  usages: AiUsageType[];
  onGenerate: () => void;
  onStop: () => void;
}

export function AiDescriptionPanel({
  preview,
  isStreaming,
  isStreamingCompleted,
  usages,
  onGenerate,
  onStop,
}: AiDescriptionPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <AiDescriptionPreview
        preview={preview}
        isStreaming={isStreaming}
        isStreamingCompleted={isStreamingCompleted}
      />
      <GenerateDescriptionButton
        isStreaming={isStreaming}
        isStreamingCompleted={isStreamingCompleted}
        onGenerate={onGenerate}
        onStop={onStop}
      />
      <DescriptionUsage usages={usages} />
    </div>
  );
}
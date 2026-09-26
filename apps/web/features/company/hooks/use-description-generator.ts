"use client";

import { useCallback, useRef, useState } from "react";

import {
  StreamCompanyDescriptionInput,
  useStreamCompanyDescription,
} from "@/features/company/api/company.api.hook";
import { AiUsageType } from "@/features/company/company.schema";
import useSessionStorage from "@/hooks/use-session-storage";

interface UseDescriptionGeneratorOptions {
  getInput: () => StreamCompanyDescriptionInput;
  onDescription?: (description: string) => void;
  onUsage?: (usage: AiUsageType | undefined) => void;
  storageKeys: {
    preview: string;
    completed: string;
  };
}

export function useDescriptionGenerator({
  getInput,
  onDescription,
  onUsage,
  storageKeys,
}: UseDescriptionGeneratorOptions) {
  const [aiPreview, setAiPreview, removeAiPreview] = useSessionStorage(
    storageKeys.preview,
    ""
  );
  const [
    isStreamingCompleted,
    setIsStreamingCompleted,
    removeIsStreamingCompleted,
  ] = useSessionStorage(storageKeys.completed, false);
  const [showStreamingAlert, setShowStreamingAlert] = useState(false);

  const { start, stop, isStreaming } = useStreamCompanyDescription();

  const getInputRef = useRef(getInput);
  const onDescriptionRef = useRef(onDescription);
  const onUsageRef = useRef(onUsage);

  const startGenerating = useCallback(() => {
    setAiPreview("");
    setIsStreamingCompleted(false);

    start(getInputRef.current(), {
      onDelta: (description) => {
        setAiPreview(description);
        onDescriptionRef.current?.(description);
      },
      onDone: ({ usage }) => {
        onUsageRef.current?.(usage);
        setIsStreamingCompleted(true);
      },
    });
  }, [start, setAiPreview, setIsStreamingCompleted]);

  const resetDescription = useCallback(() => {
    removeAiPreview();
    removeIsStreamingCompleted();
    onUsageRef.current?.(undefined);
  }, [removeAiPreview, removeIsStreamingCompleted]);

  return {
    isStreaming,
    aiPreview,
    isStreamingCompleted,
    setIsStreamingCompleted,
    showStreamingAlert,
    setShowStreamingAlert,
    resetDescription,
    startGenerating,
    stopGenerating: stop,
  };
}

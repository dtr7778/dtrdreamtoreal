"use client";

import { useCallback } from "react";

import { parseAsBoolean, useQueryState } from "nuqs";
import { UseFormReturn } from "react-hook-form";

import {
  AiUsageType,
  CompanyCreateType,
} from "@/features/company/company.schema";
import { useDescriptionGenerator } from "@/features/company/hooks/use-description-generator";

interface UseCompanyDescriptionOptions {
  form: UseFormReturn<CompanyCreateType>;
  onAiUsage: (value: AiUsageType | undefined) => void;
  onClose?: () => void;
}

export function useCompanyDescription({
  form,
  onAiUsage,
  onClose,
}: UseCompanyDescriptionOptions) {
  const [aiDialogOpen, setAiDialogOpen] = useQueryState(
    "ai-description",
    parseAsBoolean.withDefault(false)
  );

  const {
    isStreaming,
    aiPreview,
    isStreamingCompleted,
    setIsStreamingCompleted,
    showStreamingAlert,
    setShowStreamingAlert,
    startGenerating,
    stopGenerating,
    resetDescription: resetGenerator,
  } = useDescriptionGenerator({
    getInput: () => {
      const { name, industry, website, context } = form.getValues();
      return { name, industry, website, context };
    },
    onDescription: (description) => {
      form.setValue("description", description, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    onUsage: onAiUsage,
    storageKeys: {
      preview: "ai-preview",
      completed: "is-stream-completed",
    },
  });

  const openAiDialog = useCallback(() => {
    void setAiDialogOpen(true);
  }, [setAiDialogOpen]);

  const closeAiDialog = useCallback(() => {
    setAiDialogOpen(false);
    onClose?.();
  }, [onClose, setAiDialogOpen]);

  const resetDescription = useCallback(() => {
    resetGenerator();
    setAiDialogOpen(false);
  }, [resetGenerator, setAiDialogOpen]);

  return {
    aiDialogOpen,
    openAiDialog,
    closeAiDialog,
    isStreaming,
    startGenerating,
    stopGenerating,
    aiPreview,
    showStreamingAlert,
    setShowStreamingAlert,
    isStreamingCompleted,
    setIsStreamingCompleted,
    resetDescription,
  };
}

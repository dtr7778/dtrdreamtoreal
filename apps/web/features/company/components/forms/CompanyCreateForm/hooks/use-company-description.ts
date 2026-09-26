"use client";

import { useCallback, useState } from "react";

import { parseAsBoolean, useQueryState } from "nuqs";
import { UseFormReturn } from "react-hook-form";

import { useStreamCompanyDescription } from "@/features/company/api/company.api.hook";
import type {
  AiUsageType,
  CompanyCreateType,
} from "@/features/company/company.schema";
import useSessionStorage from "@/hooks/use-session-storage";

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
  const [aiPreview, setAiPreview] = useSessionStorage("ai-preview", "");

  const [isStreamingCompleted, setIsStreamingCompleted] =
    useSessionStorage<boolean>("is-stream-completed", false);
  const [showStreamingAlert, setShowStreamingAlert] = useState(false);

  const { start, stop, isStreaming } = useStreamCompanyDescription();

  const openAiDialog = useCallback(() => {
    void setAiDialogOpen(true);
  }, [setAiDialogOpen]);

  const closeAiDialog = useCallback(() => {
    setAiDialogOpen(false);
    onClose?.();
  }, [onClose, setAiDialogOpen]);

  const generateDescription = useCallback(() => {
    const { name, industry, website, context } = form.getValues();

    setAiPreview("");
    setIsStreamingCompleted(false);

    start(
      { name, industry, website, context },
      {
        onDelta: (description) => {
          setAiPreview(description);
          form.setValue("description", description, {
            shouldDirty: true,
            shouldValidate: true,
          });
        },
        onDone: ({ usage }) => {
          onAiUsage(usage);
          setIsStreamingCompleted(true);
        },
      }
    );
  }, [form, start, setAiPreview, onAiUsage, setIsStreamingCompleted]);

  const resetDescription = useCallback(() => {
    setAiPreview("");
    onAiUsage(undefined);
    setShowStreamingAlert(false);
    setAiDialogOpen(false);
  }, [setAiPreview, onAiUsage, setAiDialogOpen]);

  return {
    aiDialogOpen,
    openAiDialog,
    closeAiDialog,
    isStreaming,
    generateDescription,
    stopDescription: stop,
    aiPreview,
    showStreamingAlert,
    setShowStreamingAlert,
    isStreamingCompleted,
    setIsStreamingCompleted,
    resetDescription,
  };
}

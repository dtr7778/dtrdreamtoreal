"use client";

import { createContext, useContext } from "react";

import { AiUsageType } from "@/features/company/company.schema";
import { DispatchAction } from "@/hooks/use-session-storage";

export type CompanyDescriptionContextValue = {
  aiDialogOpen: boolean;
  openAiDialog: () => void;
  closeAiDialog: () => void;

  isStreaming: boolean;
  startGenerating: () => void;
  stopGenerating: () => void;

  aiPreview: string;
  aiUsages: AiUsageType[];

  showStreamingAlert: boolean;
  setShowStreamingAlert: (open: boolean) => void;

  isStreamingCompleted: boolean;
  setIsStreamingCompleted: (action: DispatchAction<boolean>) => void;
};

export const CompanyDescriptionContext =
  createContext<CompanyDescriptionContextValue | null>(null);

export function useCompanyDescriptionContext() {
  const context = useContext(CompanyDescriptionContext);
  if (!context) {
    throw new Error("'CompanyDescriptionContext' not found");
  }
  return context;
}

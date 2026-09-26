"use client";

import React, { createContext, useContext } from "react";

import { Control } from "react-hook-form";

import { StepperProps } from "@workspace/ui/components/stepper";

import { CompanyCreateType } from "@/features/company/company.schema";

import { CompanyFormStep } from "../data/company-form.constants";

export type CompanyFormContextValue = {
  control: Control<CompanyCreateType>;
  isPending: boolean;

  steps: Array<CompanyFormStep>;
  step: string;
  stepIndex: number;
  handleStep: (value: string) => void;

  onValidate: NonNullable<StepperProps["onValidate"]>;

  handleReset: () => void;
  handleResetAll: () => void;
  handleSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void;
};

export const CompanyFormContext =
  createContext<CompanyFormContextValue | null>(null);

export function useCompanyFormContext() {
  const context = useContext(CompanyFormContext);
  if (!context) {
    throw new Error("'CompanyFormContext' not found");
  }
  return context;
}

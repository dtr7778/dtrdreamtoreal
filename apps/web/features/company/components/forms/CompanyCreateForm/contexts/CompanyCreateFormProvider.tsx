"use client";

import React, { useCallback, useMemo } from "react";

import toast from "react-hot-toast";

import { StepperProps } from "@workspace/ui/components/stepper";

import { useCreateCompany } from "@/features/company/api/company.api.hook";
import {
  AiUsageType,
  CompanyCreateType,
} from "@/features/company/company.schema";
import useSessionStorage from "@/hooks/use-session-storage";

import {
  COMPANY_CREATE_DEFAULTS,
  companyFormSteps,
} from "../data/company-form.constants";
import { useCompanyDescription } from "../hooks/use-company-description";
import { useCompanyForm } from "../hooks/use-company-form";
import { CompanyCreateDraft } from "../types";
import {
  CompanyDescriptionContext,
  CompanyDescriptionContextValue,
} from "./CompanyDescriptionContext";
import {
  CompanyFormContext,
  CompanyFormContextValue,
} from "./CompanyFormContext";

interface CompanyCreateFormProviderProps {
  children: React.ReactNode;
}

export const INITIAL_DRAFT: CompanyCreateDraft = {
  step: "details",
  values: COMPANY_CREATE_DEFAULTS,
};

export function CompanyCreateFormProvider({
  children,
}: CompanyCreateFormProviderProps) {
  "use no memo";

  const [draft, setDraft] = useSessionStorage<CompanyCreateDraft>(
    "company-create-draft",
    INITIAL_DRAFT
  );
  const [aiUsages, setAiUsages, removeAiUsages] = useSessionStorage<
    Array<AiUsageType>
  >("company-create-ai-usages", []);

  const handleValuesChange = useCallback(
    (values: CompanyCreateType) => {
      setDraft((prev) => ({ ...prev, values }));
    },
    [setDraft]
  );

  const handleStepChange = useCallback(
    (value: string) => {
      setDraft((prev) => ({ ...prev, step: value }));
    },
    [setDraft]
  );

  const { form, control, step, stepIndex, handleStep, handleReset, resetForm } =
    useCompanyForm({
      defaultValues: draft.values,
      initialStep: draft.step,
      onValuesChange: handleValuesChange,
      onStepChange: handleStepChange,
    });

  const handleAiUsage = useCallback(
    (value: AiUsageType | undefined) => {
      if (!value) {
        setAiUsages([]);
      } else {
        setAiUsages((prev) => {
          if (prev.findIndex(({ id }) => value.id === id) !== -1) return prev;

          return [...prev, value];
        });
      }
    },
    [setAiUsages]
  );

  const advanceFromDialog = useCallback(() => {
    const nextStep = companyFormSteps[stepIndex + 1];
    if (nextStep) handleStep(nextStep.value);
  }, [stepIndex, handleStep]);

  const {
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
  } = useCompanyDescription({
    form,
    onAiUsage: handleAiUsage,
    onClose: advanceFromDialog,
  });

  const { mutate, isPending } = useCreateCompany<keyof CompanyCreateType>({
    onSuccess: () => {
      setDraft(INITIAL_DRAFT);
      resetDescription();
      removeAiUsages();
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, { message });
      });
    },
  });

  const handleSubmit = useCallback(
    (event: React.SubmitEvent<HTMLFormElement>) => {
      form.handleSubmit((data) =>
        mutate({ ...data, aiUsageIds: aiUsages.map(({ id }) => id) })
      )(event);
    },
    [mutate, form, aiUsages]
  );

  const onValidate: NonNullable<StepperProps["onValidate"]> = useCallback(
    async (_value, direction) => {
      if (direction === "prev") return true;

      if (step === "brief") {
        const context = form.getValues("context");
        const hasAnswers = Object.values(context ?? {}).some((value) =>
          Array.isArray(value)
            ? value.length > 0
            : (value ?? "").trim().length > 0
        );
        if (hasAnswers) {
          openAiDialog();
          return false;
        }
      }

      const stepData = companyFormSteps.find((s) => s.value === step);
      if (!stepData) return true;

      const isValid = await form.trigger(stepData.fields);

      if (!isValid) {
        toast("Complete all required fields to continue", {
          icon: "⚠️",
        });
      }

      return isValid;
    },
    [form, step, openAiDialog]
  );

  const handleResetAll = useCallback(() => {
    setDraft(INITIAL_DRAFT);
    resetForm(COMPANY_CREATE_DEFAULTS);
    resetDescription();
    removeAiUsages();
  }, [resetForm, resetDescription, setDraft, removeAiUsages]);

  const formValue = useMemo<CompanyFormContextValue>(
    () => ({
      control,
      isPending,
      steps: companyFormSteps,
      step,
      stepIndex,
      handleStep,
      onValidate,
      handleReset,
      handleResetAll,
      handleSubmit,
    }),
    [
      control,
      isPending,
      step,
      stepIndex,
      handleStep,
      onValidate,
      handleReset,
      handleResetAll,
      handleSubmit,
    ]
  );

  const descriptionValue = useMemo<CompanyDescriptionContextValue>(
    () => ({
      aiDialogOpen,
      openAiDialog,
      closeAiDialog,
      isStreaming,
      startGenerating,
      stopGenerating,
      aiPreview,
      aiUsages,
      showStreamingAlert,
      setShowStreamingAlert,
      isStreamingCompleted,
      setIsStreamingCompleted,
    }),
    [
      aiDialogOpen,
      openAiDialog,
      closeAiDialog,
      isStreaming,
      startGenerating,
      stopGenerating,
      aiPreview,
      aiUsages,
      showStreamingAlert,
      setShowStreamingAlert,
      isStreamingCompleted,
      setIsStreamingCompleted,
    ]
  );

  return (
    <CompanyFormContext.Provider value={formValue}>
      <CompanyDescriptionContext.Provider value={descriptionValue}>
        {children}
      </CompanyDescriptionContext.Provider>
    </CompanyFormContext.Provider>
  );
}

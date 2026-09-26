"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  companyCreateSchema,
  CompanyCreateType,
} from "@/features/company/company.schema";

import { companyFormSteps } from "../data/company-form.constants";

const DRAFT_DEBOUNCE_MS = 400;

interface UseCompanyFormOptions {
  defaultValues: CompanyCreateType;
  initialStep: string;
  onValuesChange: (values: CompanyCreateType) => void;
  onStepChange: (step: string) => void;
}

export function useCompanyForm({
  defaultValues,
  initialStep,
  onValuesChange,
  onStepChange,
}: UseCompanyFormOptions) {
  const [step, setStep] = useState(initialStep);

  const form = useForm<CompanyCreateType>({
    resolver: zodResolver(companyCreateSchema),
    defaultValues,
    mode: "onBlur",
  });

  const onValuesChangeRef = useRef(onValuesChange);

  useEffect(() => {
    onValuesChangeRef.current = onValuesChange;
  }, [onValuesChange]);

  const skipNextPersistRef = useRef(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const unsubscribe = form.subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        clearTimeout(timeout);

        if (skipNextPersistRef.current) {
          skipNextPersistRef.current = false;
          return;
        }

        timeout = setTimeout(() => {
          onValuesChangeRef.current(values);
        }, DRAFT_DEBOUNCE_MS);
      },
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [form]);

  const stepIndex = useMemo(
    () => companyFormSteps.findIndex((s) => s.value === step),
    [step]
  );

  const handleStep = useCallback(
    (value: string) => {
      setStep(value);
      onStepChange(value);
    },
    [onStepChange]
  );

  const handleReset = useCallback(() => {
    const stepData = companyFormSteps.find((s) => s.value === step);
    if (!stepData) return;

    stepData.fields.forEach((field) => {
      form.resetField(field);
    });
  }, [form, step]);

  const resetForm = useCallback(
    (values: CompanyCreateType) => {
      skipNextPersistRef.current = true;
      form.reset(values);
      setStep("details");
    },
    [form]
  );

  return {
    form,
    control: form.control,
    step,
    stepIndex,
    handleStep,
    handleReset,
    resetForm,
  };
}

"use client";

import type { ComponentType } from "react";

import { ArrowLeft, ArrowRight, RotateCcw, Undo } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { Button } from "@workspace/ui/components/button";
import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperNext,
  StepperPrev,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@workspace/ui/components/stepper";

import { CompanyCreateFormProvider } from "./contexts/CompanyCreateFormProvider";
import { useCompanyFormContext } from "./contexts/CompanyFormContext";
import { formAnimationVariants } from "./data/company-form.constants";
import { BriefStep } from "./steps/BriefStep";
import { DetailsStep } from "./steps/DetailsStep";
import { EmployeeStep } from "./steps/EmployeeStep";

const stepComponents: Record<string, ComponentType> = {
  details: DetailsStep,
  brief: BriefStep,
  employee: EmployeeStep,
};

export function CompanyCreateForm() {
  "use no memo";
  return (
    <CompanyCreateFormProvider>
      <CompanyCreateFormContent />
    </CompanyCreateFormProvider>
  );
}

function CompanyCreateFormContent() {
  "use no memo";

  const {
    steps,
    step,
    stepIndex,
    handleStep,
    onValidate,
    handleReset,
    handleResetAll,
    handleSubmit,
    isPending,
  } = useCompanyFormContext();

  return (
    <form onSubmit={handleSubmit}>
      <Stepper value={step} onValueChange={handleStep} onValidate={onValidate}>
        {/* stepper list start */}
        <motion.div
          variants={formAnimationVariants}
          initial="hidden"
          animate="visible"
        >
          <StepperList>
            {steps.map((stepItem, idx) => (
              <StepperItem key={stepItem.value} value={stepItem.value}>
                <StepperTrigger>
                  <StepperIndicator>{idx + 1}</StepperIndicator>
                  <div className="flex flex-col gap-px">
                    <StepperTitle>{stepItem.title}</StepperTitle>
                    <StepperDescription>
                      {stepItem.description}
                    </StepperDescription>
                  </div>
                </StepperTrigger>
                <StepperSeparator className="mx-2" />
              </StepperItem>
            ))}
          </StepperList>
        </motion.div>
        {/* stepper list end */}

        <AnimatePresence mode="sync">
          {steps.map((stepItem) => {
            const StepComponent = stepComponents[stepItem.value];
            if (!StepComponent) return null;

            return (
              <StepperContent key={stepItem.value} value={stepItem.value}>
                <StepComponent key={`${stepItem.value}-content`} />
              </StepperContent>
            );
          })}
        </AnimatePresence>

        <motion.div
          variants={formAnimationVariants}
          initial="hidden"
          animate="visible"
          className="mt-4 flex items-center gap-4 text-center justify-between"
        >
          <StepperPrev
            disabled={isPending}
            render={<Button variant="secondary" type="button" />}
          >
            <ArrowLeft className="size-4" />
            <span>Previous</span>
          </StepperPrev>

          <div className="flex flex-wrap justify-center items-center gap-2">
            <Button
              type="reset"
              variant="outline"
              onClick={handleReset}
              disabled={isPending}
            >
              <Undo />
              <span>Reset</span>
            </Button>
            <Button
              type="reset"
              variant="outline"
              onClick={handleResetAll}
              disabled={isPending}
            >
              <RotateCcw />
              <span>Reset All</span>
            </Button>
          </div>
          {stepIndex === steps.length - 1 ? (
            <ButtonSpinner type="submit" isLoading={isPending}>
              Create
            </ButtonSpinner>
          ) : (
            <StepperNext disabled={isPending} render={<Button type="button" />}>
              <span>Next</span>
              <ArrowRight className="size-4" />
            </StepperNext>
          )}
        </motion.div>
      </Stepper>
    </form>
  );
}

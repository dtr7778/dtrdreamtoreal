"use client";
import { useCallback, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, RotateCcw, Undo } from "lucide-react";
import { AnimatePresence, motion, Variants } from "motion/react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

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
  StepperProps,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@workspace/ui/components/stepper";

import { useCreateCompany } from "../../api/company.api.hook";
import { companyCreateSchema, CompanyCreateType } from "../../company.schema";
import { BriefStep } from "./steps/BriefStep";
import { DetailsStep } from "./steps/DetailsStep";
import { EmployeeStep } from "./steps/EmployeeStep";

export type CompanyFormStep = {
  value: string;
  title: string;
  description: string;
  fields: Array<keyof CompanyCreateType>;
};

const companyFormSteps: Array<CompanyFormStep> = [
  {
    value: "details",
    title: "Company Details",
    description: "Enter company information",
    fields: [
      "name",
      "legalName",
      "website",
      "industry",
      "employSize",
      "email",
      "phone",
      "socialMedia",
      "addresses",
    ],
  },
  {
    value: "brief",
    title: "Briefing",
    description: "Enter company briefing",
    fields: ["context"],
  },
  {
    value: "employee",
    title: "Employee Details",
    description: "Enter company employee information",
    fields: ["employees"],
  },
];

export const formAnimationVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      ease: "easeInOut",
      duration: 0.5,
    },
  },
};

export function CompanyCreateForm() {
  "use no memo";
  const [step, setStep] = useState<string>("details");

  const stepIndex = useMemo(
    () => companyFormSteps.findIndex((s) => s.value === step),
    [step]
  );

  const form = useForm<CompanyCreateType>({
    resolver: zodResolver(companyCreateSchema),
    defaultValues: {
      name: "",
      legalName: "",
      email: "",
      phone: "",
      employSize: "",
      industry: "",
      website: "",
      context: {},
      addresses: [
        {
          type: "work",
          streetLine1: "",
          city: "",
          zipCode: "",
          state: "",
          country: "",
          notes: "",
          isPrimary: true,
        },
      ],
      socialMedia: [
        {
          type: "company",
          platform: "facebook",
          url: "",
          username: "",
          displayName: "",
          notes: "",
        },
      ],
      employees: [
        {
          firstName: "",
          middleName: "",
          lastName: "",
          email: "",
          phone: "",
          department: "",
          jobTitle: "",
          website: "",
          addresses: [],
          socialMedia: [],
        },
      ],
    },
  });

  const handleReset = () => {
    const stepData = companyFormSteps.find((s) => s.value === step);
    if (!stepData) return true;

    stepData.fields.forEach((field) => {
      form.resetField(field);
    });
  };

  const handleResetAll = () => {
    form.reset();
    setStep("details");
  };

  const { mutate, isPending } = useCreateCompany<keyof CompanyCreateType>({
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, { message });
      });
    },
  });

  const onValidate: NonNullable<StepperProps["onValidate"]> = useCallback(
    async (_value, direction) => {
      if (direction === "prev") return true;

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
    [form, step]
  );

  const handleSubmit = (data: CompanyCreateType) => mutate(data);

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Stepper value={step} onValueChange={setStep} onValidate={onValidate}>
        {/* stepper list start */}
        <motion.div
          variants={formAnimationVariants}
          initial="hidden"
          animate="visible"
        >
          <StepperList>
            {companyFormSteps.map((step, idx) => (
              <StepperItem key={step.value} value={step.value}>
                <StepperTrigger>
                  <StepperIndicator>{idx + 1}</StepperIndicator>
                  <div className="flex flex-col gap-px">
                    <StepperTitle>{step.title}</StepperTitle>
                    <StepperDescription>{step.description}</StepperDescription>
                  </div>
                </StepperTrigger>
                <StepperSeparator className="mx-2" />
              </StepperItem>
            ))}
          </StepperList>
        </motion.div>
        {/* stepper list end */}

        <AnimatePresence mode="sync">
          <StepperContent key="details" value="details">
            <DetailsStep
              key="details"
              control={form.control}
              disabled={isPending}
            />
          </StepperContent>
          <StepperContent key="brief" value="brief">
            <BriefStep
              key="brief"
              control={form.control}
              disabled={isPending}
            />
          </StepperContent>
          <StepperContent key="employee" value="employee">
            <EmployeeStep
              key="employee"
              control={form.control}
              disabled={isPending}
            />
          </StepperContent>
        </AnimatePresence>

        <motion.div
          variants={formAnimationVariants}
          initial="hidden"
          animate="visible"
          className="mt-4 flex items-center gap-4 text-center justify-between"
        >
          <StepperPrev
            disabled={isPending}
            render={<Button type="button" variant="secondary" />}
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
          {stepIndex === companyFormSteps.length - 1 ? (
            <ButtonSpinner type="submit" isLoading={isPending}>
              Submit
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

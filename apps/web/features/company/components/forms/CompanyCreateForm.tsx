"use client";
import { Fragment, useCallback, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  RotateCcw,
  Trash2,
  Undo,
} from "lucide-react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { Control, useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { Button } from "@workspace/ui/components/button";
import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import {
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { PhoneInputField } from "@workspace/ui/components/form-fields/PhoneInputField";
import { TextareaField } from "@workspace/ui/components/form-fields/TextareaField";
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
import { AddressField } from "./AddressField";
import { SocialMediaField } from "./SocialMediaField";

const steps: Array<{
  value: string;
  title: string;
  description: string;
  fields: Array<keyof CompanyCreateType>;
}> = [
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
      "description",
      "socialMedia",
      "addresses",
    ] as const,
  },
  {
    value: "employee",
    title: "Employee Details",
    description: "Enter compnay employee information",
    fields: ["employees"] as const,
  },
];

const animationVariants: Variants = {
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
    () => steps.findIndex((s) => s.value === step),
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
      description: "",
      addresses: [],
      socialMedia: [],
      employees: [],
    },
  });

  const handleReset = () => {
    const stepData = steps.find((s) => s.value === step);
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

      const stepData = steps.find((s) => s.value === step);
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
          variants={animationVariants}
          initial="hidden"
          animate="visible"
        >
          <StepperList>
            {steps.map((step, idx) => (
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
          <DetailsStep
            value="details"
            control={form.control}
            disabled={isPending}
          />
          <EmployeeStep
            value="employee"
            control={form.control}
            disabled={isPending}
          />
        </AnimatePresence>

        <motion.div
          variants={animationVariants}
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
          {stepIndex === steps.length - 1 ? (
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

function DetailsStep({
  control,
  value,
  disabled,
}: {
  control: Control<CompanyCreateType>;
  value: string;
  disabled?: boolean;
}) {
  "use no memo";

  return (
    <StepperContent value={value}>
      <motion.div
        variants={animationVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        key="details-step-content"
      >
        <FieldGroup>
          <InputField
            control={control}
            name="name"
            label="Name"
            placeholder="Company name"
            disabled={disabled}
            requiredField
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              control={control}
              name="legalName"
              label="Legal name"
              placeholder="Legal name"
              disabled={disabled}
            />
            <InputField
              control={control}
              name="employSize"
              label="Employee Size"
              placeholder="1-10, 11-50, 51-200, etc."
              disabled={disabled}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              control={control}
              type="email"
              name="email"
              label="Email"
              placeholder="contact@company.com"
              disabled={disabled}
            />
            <PhoneInputField
              control={control}
              name="phone"
              label="Phone"
              placeholder="+1 234 567 890"
              disabled={disabled}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              control={control}
              type="url"
              name="website"
              label="Website"
              placeholder="https://company.com"
              disabled={disabled}
            />
            <InputField
              control={control}
              name="industry"
              label="Industry"
              disabled={disabled}
            />
          </div>

          <TextareaField
            control={control}
            name="description"
            label="Description"
            placeholder="Brief description of the company"
            disabled={disabled}
          />

          <FieldGroup className="p-4 bg-muted/30 border rounded-md">
            <SocialMediaField
              control={control}
              name="socialMedia"
              disabled={disabled}
              legend="Company social media"
              addLabel="Add Social media"
              defaultType="company"
            />

            <AddressField
              control={control}
              name="addresses"
              disabled={disabled}
              legend="Company Address"
              addLabel="Add address"
              defaultType="work"
            />
          </FieldGroup>
        </FieldGroup>
      </motion.div>
    </StepperContent>
  );
}

function EmployeeStep({
  control,
  value,
  disabled,
}: {
  control: Control<CompanyCreateType>;
  value: string;
  disabled?: boolean;
}) {
  "use no memo";
  return (
    <StepperContent value={value}>
      <motion.div
        variants={animationVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        key="employee-step-content"
      >
        <CompanyEmployeeField control={control} disabled={disabled} />
      </motion.div>
    </StepperContent>
  );
}

function CompanyEmployeeField({
  control,
  disabled,
}: {
  control: Control<CompanyCreateType>;
  disabled?: boolean;
}) {
  "use no memo";
  const { fields, append, remove } = useFieldArray({
    control,
    name: "employees",
  });

  const handleAppend = () => {
    append({
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
    });
  };

  return (
    <FieldSet>
      <FieldLegend>Company Employees</FieldLegend>
      <FieldGroup>
        {fields.map((field, idx) => (
          <Fragment key={field.id}>
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-foreground tracking-tight">
                  {`Employee #${idx + 1}`}
                </h4>

                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(idx)}
                  disabled={disabled}
                >
                  <Trash2 />
                </Button>
              </div>

              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-3">
                  <InputField
                    control={control}
                    name={`employees.${idx}.firstName`}
                    label="First Name"
                    placeholder="First name"
                    disabled={disabled}
                    requiredField
                  />
                  <InputField
                    control={control}
                    name={`employees.${idx}.middleName`}
                    label="Middle Name"
                    placeholder="Middle name"
                    disabled={disabled}
                  />
                  <InputField
                    control={control}
                    name={`employees.${idx}.lastName`}
                    label="Last Name"
                    placeholder="Last name"
                    disabled={disabled}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    control={control}
                    type="email"
                    name={`employees.${idx}.email`}
                    label="Email"
                    placeholder="employee@company.com"
                    disabled={disabled}
                  />
                  <PhoneInputField
                    control={control}
                    name={`employees.${idx}.phone`}
                    label="Phone"
                    placeholder="+1 234 567 890"
                    disabled={disabled}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField
                    control={control}
                    name={`employees.${idx}.jobTitle`}
                    label="Job Title"
                    placeholder="Software Engineer"
                    disabled={disabled}
                  />
                  <InputField
                    control={control}
                    name={`employees.${idx}.department`}
                    label="Department"
                    placeholder="Engineering"
                    disabled={disabled}
                  />
                </div>
                <InputField
                  control={control}
                  type="url"
                  name={`employees.${idx}.website`}
                  label="Website"
                  placeholder="https://example.com"
                  disabled={disabled}
                />

                <FieldGroup className="p-4 bg-muted/30 border rounded-md">
                  <SocialMediaField
                    control={control}
                    name={`employees.${idx}.socialMedia`}
                    disabled={disabled}
                    legend={`Employee #${idx + 1} Social media`}
                    addLabel="Add Social media"
                    defaultType="person"
                  />

                  <AddressField
                    control={control}
                    name={`employees.${idx}.addresses`}
                    disabled={disabled}
                    legend={`Employee #${idx + 1} Address`}
                    addLabel="Add address"
                    defaultType="home"
                  />
                </FieldGroup>
              </FieldGroup>
            </div>

            {idx < fields.length - 1 && <FieldSeparator />}
          </Fragment>
        ))}

        <Button
          type="button"
          variant="secondary"
          className="w-fit"
          onClick={handleAppend}
          disabled={disabled}
        >
          <Plus className="size-4" />
          <span>Add employee</span>
        </Button>
      </FieldGroup>
    </FieldSet>
  );
}

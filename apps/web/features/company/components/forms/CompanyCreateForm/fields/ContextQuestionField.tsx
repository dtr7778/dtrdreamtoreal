"use client";

import { Control, Path } from "react-hook-form";

import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { SelectField } from "@workspace/ui/components/form-fields/SelectField";
import { TextareaField } from "@workspace/ui/components/form-fields/TextareaField";

import { CompanyCreateType } from "@/features/company/company.schema";

import { ContextQuestion } from "../data/context-questions";
import { ContextArrayField } from "./ContextArrayField";

export function ContextQuestionField({
  question,
  control,
  disabled,
}: {
  question: ContextQuestion;
  control: Control<CompanyCreateType>;
  disabled?: boolean;
}) {
  "use no memo";

  const name = `context.${question.name}` as Path<CompanyCreateType>;

  if (question.type === "array") {
    return (
      <ContextArrayField
        control={control}
        name={name}
        label={question.label}
        placeholder={question.placeholder}
        description={question.description}
        disabled={disabled}
      />
    );
  }

  if (question.type === "select") {
    return (
      <SelectField
        control={control}
        name={name}
        label={question.label}
        options={question.options ?? []}
        placeholder={question.placeholder}
        description={question.description}
        disabled={disabled}
      />
    );
  }

  if (question.type === "textarea") {
    return (
      <TextareaField
        control={control}
        name={name}
        label={question.label}
        placeholder={question.placeholder}
        description={question.description}
        disabled={disabled}
      />
    );
  }

  return (
    <InputField
      control={control}
      name={name}
      label={question.label}
      placeholder={question.placeholder}
      description={question.description}
      disabled={disabled}
    />
  );
}

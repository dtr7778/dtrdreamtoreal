import { UserSelectorField } from "#/features/user/components/UserSelectorField";
import type { Control, FieldValues, UseFormReturn } from "react-hook-form";

import { FieldGroup } from "@workspace/ui/components/field";
import { DateTimePickerField } from "@workspace/ui/components/form-fields/DateTimePickerField";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { SelectField } from "@workspace/ui/components/form-fields/SelectField";
import { TextareaField } from "@workspace/ui/components/form-fields/TextareaField";

import { TASK_PRIORITY_OPTIONS } from "../../task.constant";
import type {
  CompanyTaskCreateType,
  CompanyTaskUpdateType,
} from "../../task.schema";

type CompanyTaskFormValues = CompanyTaskCreateType | CompanyTaskUpdateType;

export function CompanyTaskForm<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  formId,
  isPending,
}: {
  form: UseFormReturn<TFieldValues>;
  onSubmit: React.SubmitEventHandler<HTMLFormElement>;
  formId: string;
  isPending: boolean;
}) {
  const control = form.control as unknown as Control<CompanyTaskFormValues>;

  return (
    <form id={formId} onSubmit={onSubmit}>
      <FieldGroup>
        <InputField
          control={control}
          name="title"
          type="text"
          label="Title"
          placeholder="What needs to be done?"
          requiredField
          disabled={isPending}
        />
        <TextareaField
          control={control}
          name="description"
          label="Description"
          placeholder="Add more detail (optional)"
          disabled={isPending}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            control={control}
            name="priority"
            label="Priority"
            options={TASK_PRIORITY_OPTIONS}
            disabled={isPending}
          />
          <DateTimePickerField
            control={control}
            name="dueDate"
            label="Due date"
            placeholder="Pick a date"
            showTimeSelection={false}
            disabled={isPending}
          />
        </div>
        <UserSelectorField
          control={control}
          name="assigneeIds"
          label="Assignees"
          multiple
          fetchApi
          disabled={isPending}
        />
      </FieldGroup>
    </form>
  );
}

"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";

import { TaskPriorityEnumSchema } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogResponsiveBody,
  DialogResponsiveContent,
  DialogStickyFooter,
  DialogStickyHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { FieldGroup } from "@workspace/ui/components/field";
import { DateTimePickerField } from "@workspace/ui/components/form-fields/DateTimePickerField";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { SelectField } from "@workspace/ui/components/form-fields/SelectField";
import { TextareaField } from "@workspace/ui/components/form-fields/TextareaField";

import { UserSelectorField } from "@/features/user/components/UserSelectorField";
import { useAuthStore } from "@/stores/zustand/auth/AuthStoreContext";

import { useCreateTask } from "../api/task.api.hook";
import { taskCreateSchema, TaskCreateType } from "../task.schema";

const PRIORITY_OPTIONS = TaskPriorityEnumSchema.options.map((value) => ({
  value,
  label: formatEnumValue(value),
}));

export function CreateTaskDialog() {
  "use no memo";
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const user = useAuthStore((state) => state.user!);

  const form = useForm<TaskCreateType>({
    resolver: zodResolver(taskCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      dueDate: null,
      assignedBy: null,
    },
  });

  const { mutate, isPending } = useCreateTask<keyof TaskCreateType>({
    onSuccess: () => {
      form.reset();
      setOpenDialog(false);
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, { message });
      });
    },
  });

  const handleSubmit = (e: TaskCreateType) => {
    mutate(e);
  };

  const formId = "org_task_create_form_id";

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger render={<Button className="w-fit" />}>
        <PlusCircle />
        <span>New Task</span>
      </DialogTrigger>
      <DialogResponsiveContent>
        <DialogStickyHeader>
          <DialogTitle>Create a new task</DialogTitle>
          <DialogDescription>Add a new task on board.</DialogDescription>
        </DialogStickyHeader>

        <DialogResponsiveBody>
          <form id={formId} onSubmit={form.handleSubmit(handleSubmit)}>
            <FieldGroup>
              <InputField
                control={form.control}
                name="title"
                label="Title"
                requiredField
                placeholder="Short summary of the task"
                disabled={isPending}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  control={form.control}
                  name="priority"
                  label="Priority"
                  requiredField
                  options={PRIORITY_OPTIONS}
                  disabled={isPending}
                />
                <DateTimePickerField
                  control={form.control}
                  name="dueDate"
                  label="Due Date"
                  timezone={user?.timezone}
                  disabled={isPending}
                />
              </div>
              <UserSelectorField
                control={form.control}
                name="assignedBy"
                label="Assigned to"
                disabled={isPending}
                requiredField
              />
              <TextareaField
                control={form.control}
                name="description"
                label="Description"
                placeholder="Describe the task in detail..."
                className="min-h-32"
                disabled={isPending}
              />
            </FieldGroup>
          </form>
        </DialogResponsiveBody>

        <DialogStickyFooter>
          <DialogClose
            render={<Button variant="outline" disabled={isPending} />}
          >
            Cancel
          </DialogClose>
          <ButtonSpinner form={formId} type="submit" isLoading={isPending}>
            Create task
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}

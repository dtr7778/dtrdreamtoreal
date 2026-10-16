import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type z from "zod";

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
} from "@workspace/ui/components/dialog";

import { useCreateCompanyTask } from "../../api/task.api.hook";
import { companyTaskCreateSchema } from "../../task.schema";
import type { CompanyTaskCreateType } from "../../task.schema";
import { CompanyTaskForm } from "../form/CompanyTaskForm";

function toStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompanyTaskCreateDialog({
  open,
  onOpenChange,
}: TaskFormDialogProps) {
  "use no memo";
  const { mutate, isPending } = useCreateCompanyTask({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const formId = "company_task_create_form";

  const form = useForm<
    z.input<typeof companyTaskCreateSchema>,
    unknown,
    CompanyTaskCreateType
  >({
    resolver: zodResolver(companyTaskCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      dueDate: null,
      assigneeIds: [],
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    mutate({
      ...values,
      dueDate: values.dueDate ? toStartOfDay(values.dueDate) : null,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogResponsiveContent className="w-full sm:max-w-xl">
        <DialogStickyHeader>
          <DialogTitle>New company task</DialogTitle>
          <DialogDescription>
            Company tasks are visible to everyone in the company.
          </DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <CompanyTaskForm
            formId={formId}
            form={form}
            onSubmit={handleSubmit}
            isPending={isPending}
          />
        </DialogResponsiveBody>
        <DialogStickyFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline" disabled={isPending} />
            }
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

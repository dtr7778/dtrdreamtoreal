import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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

import { useCreatePersonalTask } from "../../api/personalTask.api.hook";
import { personalTaskCreateSchema } from "../../task.schema";
import type { PersonalTaskCreateType } from "../../task.schema";
import { PersonalTaskForm } from "../form/PersonalTaskForm";

function toStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PersonalTaskCreateDialog({
  open,
  onOpenChange,
}: TaskFormDialogProps) {
  "use no memo";
  const { mutate, isPending } = useCreatePersonalTask({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const formId = "personal_task_create_form";

  const form = useForm<PersonalTaskCreateType>({
    resolver: zodResolver(personalTaskCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      dueDate: null,
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    mutate({
      title: values.title,
      description: values.description,
      priority: values.priority,
      dueDate: values.dueDate ? toStartOfDay(values.dueDate) : null,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogResponsiveContent className="w-full sm:max-w-xl">
        <DialogStickyHeader>
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>
            Only you can see and access your personal task.
          </DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <PersonalTaskForm
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

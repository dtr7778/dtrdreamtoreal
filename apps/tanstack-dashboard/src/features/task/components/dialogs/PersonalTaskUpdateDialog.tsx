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

import { useUpdatePersonalTask } from "../../api/personalTask.api.hook";
import type { TaskBoardItem } from "../../task.constant";
import { personalTaskUpdateSchema } from "../../task.schema";
import type { PersonalTaskUpdateType } from "../../task.schema";
import { PersonalTaskForm } from "../form/PersonalTaskForm";

function toStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

interface TaskFormDialogProps {
  task: TaskBoardItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PersonalTaskUpdateDialog({
  task,
  open,
  onOpenChange,
}: TaskFormDialogProps) {
  "use no memo";
  const formId = "personal_task_update_form";

  const { mutate, isPending } = useUpdatePersonalTask({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogResponsiveContent className="w-full sm:max-w-xl">
        <DialogStickyHeader>
          <DialogTitle>Update task</DialogTitle>
          <DialogDescription>
            Only you can see and access your personal task.
          </DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          {task ? (
            <PersonalTaskUpdateDialogBody
              task={task}
              formId={formId}
              isPending={isPending}
              onSubmit={(values) =>
                mutate({
                  ...values,
                  taskId: task.id,
                  dueDate: values.dueDate ? toStartOfDay(values.dueDate) : null,
                })
              }
            />
          ) : (
            <div className="text-destructive p-2 text-center text-lg font-semibold">
              Task is not selected
            </div>
          )}
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
            Update task
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}

function PersonalTaskUpdateDialogBody({
  formId,
  onSubmit,
  isPending,
  task,
}: {
  formId: string;
  onSubmit: (value: PersonalTaskUpdateType) => void;
  isPending: boolean;
  task: TaskBoardItem;
}) {
  "use no memo";

  const form = useForm<PersonalTaskUpdateType>({
    resolver: zodResolver(personalTaskUpdateSchema),
    defaultValues: {
      title: task.title,
      description: task.description ?? "",
      priority: task.priority,
      dueDate: task?.dueDate ?? null,
    },
  });

  return (
    <PersonalTaskForm
      formId={formId}
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      isPending={isPending}
    />
  );
}

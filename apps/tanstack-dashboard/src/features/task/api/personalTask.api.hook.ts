import { orpcTQClient } from "#/server/orpc";
import { formatOrpcError } from "#/utils/formatOrpcError";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import type { IApiHookInput } from "@workspace/lib/types";

import type { TaskBoardItem } from "../task.constant";

type TaskFieldPatch = Partial<
  Pick<
    TaskBoardItem,
    "title" | "status" | "priority" | "description" | "dueDate"
  >
>;

const personalListKey = () =>
  orpcTQClient.task.personal.list.queryKey({ input: {} });

/** Mirrors an update onto a cached task so the board reflects it before the server responds. */
function patchTask<T extends TaskBoardItem>(task: T, patch: TaskFieldPatch): T {
  return {
    ...task,
    ...(patch.title !== undefined && { title: patch.title }),
    ...(patch.status !== undefined && { status: patch.status }),
    ...(patch.priority !== undefined && { priority: patch.priority }),
    ...(patch.description !== undefined && {
      description: patch.description ?? null,
    }),
    ...(patch.dueDate !== undefined && { dueDate: patch.dueDate ?? null }),
  };
}

export function useCreatePersonalTask<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "create_personal_task_toast";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.task.personal.create.mutationOptions({
      onMutate: () => {
        toast.loading("Creating...", { id: toastId });
        onRequestStart?.();
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });
        await queryClient.invalidateQueries({
          queryKey: personalListKey(),
          exact: false,
        });
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message, type, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation" && fieldErrors) {
          onValidationErrors?.(fieldErrors);
        }

        toast.error(message, { id: toastId });
        onError?.(message);
      },
      onSettled: () => {
        onRequestEnd?.();
      },
    })
  );
}

export function useUpdatePersonalTask<TFieldNames>({
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames>) {
  const toastId = "update_personal_task_toast";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.task.personal.update.mutationOptions({
      onMutate: async (input) => {
        await queryClient.cancelQueries({ queryKey: personalListKey() });
        const previous = queryClient.getQueryData(personalListKey());

        queryClient.setQueryData(personalListKey(), (old) =>
          old
            ? {
                ...old,
                data: old.data.map((task) =>
                  task.id === input.taskId ? patchTask(task, input) : task
                ),
              }
            : old
        );

        onRequestStart?.();
        return { previous };
      },
      onSuccess: ({ message }) => {
        toast.success(message, { id: toastId });
        onSuccess?.(message);
      },
      onError: (error, _input, context) => {
        if (context?.previous) {
          queryClient.setQueryData(personalListKey(), context.previous);
        }
        const { message, type, fieldErrors } =
          formatOrpcError<TFieldNames>(error);

        if (type === "validation" && fieldErrors) {
          onValidationErrors?.(fieldErrors);
        }

        toast.error(message, { id: toastId });
        onError?.(message);
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({
          queryKey: personalListKey(),
          exact: false,
        });
        onRequestEnd?.();
      },
    })
  );
}

export function useRemovePersonalTask({
  onSuccess,
  onError,
}: Omit<IApiHookInput, "onValidationErrors">) {
  const toastId = "delete_personal_task_toast";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.task.personal.remove.mutationOptions({
      onMutate: () => {
        toast.loading("Deleting...", { id: toastId });
      },
      onSuccess: async ({ message }) => {
        toast.success(message, { id: toastId });
        await queryClient.invalidateQueries({
          queryKey: personalListKey(),
          exact: false,
        });
        onSuccess?.(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);
        toast.error(message, { id: toastId });
        onError?.(message);
      },
    })
  );
}

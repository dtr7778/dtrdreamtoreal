import { useState } from "react";

import { DeleteDialog } from "#/components/DeleteDialog";
import { orpcTQClient } from "#/server/orpc";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { TaskKanbanSkeleton } from "@workspace/ui/components/kibo-ui/kanban/KanbanSkeleton";
import { QueryStateBoundary } from "@workspace/ui/components/tanstack-query/query-state-boundary";

import {
  useRemovePersonalTask,
  useUpdatePersonalTask,
} from "../api/personalTask.api.hook";
import type { TaskBoardItem } from "../task.constant";
import { useTaskRealtime } from "../task.realtime.hook";
import { PersonalTaskCreateDialog } from "./dialogs/PersonalTaskCreateDialog";
import { PersonalTaskUpdateDialog } from "./dialogs/PersonalTaskUpdateDialog";
import { TaskBoard } from "./TaskBoard";

export function PersonalTasks() {
  useTaskRealtime("personal");

  const [openCreate, setOpenCreate] = useState<boolean>(false);

  const [openUpdate, setOpenUpdate] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<TaskBoardItem | null>(null);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TaskBoardItem | null>(null);

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.task.personal.list.queryOptions({ input: {} })
  );

  const updateTask = useUpdatePersonalTask({
    onSuccess: () => {
      setOpenUpdate(false);
      setUpdateTarget(null);
    },
  });
  const removeTask = useRemovePersonalTask({
    onSuccess: () => {
      setOpenDelete(false);
      setDeleteTarget(null);
    },
  });

  return (
    <QueryStateBoundary
      data={data?.data}
      isLoading={isLoading}
      isError={isError}
      error={error}
      isEmpty={() => false}
      loadingFallback={<TaskKanbanSkeleton totalColumn={4} />}
    >
      {(tasks) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
            </p>
            <Button onClick={() => setOpenCreate(true)}>
              <Plus />
              <span>New task</span>
            </Button>
          </div>

          <TaskBoard
            items={tasks}
            onStatusChange={(taskId, status) =>
              updateTask.mutate({ taskId, status })
            }
            onEdit={(task) => {
              setUpdateTarget(task);
              setOpenUpdate(true);
            }}
            onDelete={(task) => {
              setDeleteTarget(task);
              setOpenDelete(true);
            }}
          />

          <PersonalTaskCreateDialog
            open={openCreate}
            onOpenChange={setOpenCreate}
          />

          <PersonalTaskUpdateDialog
            task={updateTarget}
            open={openUpdate}
            onOpenChange={setOpenUpdate}
          />

          <DeleteDialog
            openDeleteDialog={openDelete}
            setOpenDeleteDialog={setOpenDelete}
            isDisable={removeTask.isPending}
            onDelete={() => {
              if (deleteTarget) removeTask.mutate({ taskId: deleteTarget.id });
            }}
          />
        </div>
      )}
    </QueryStateBoundary>
  );
}

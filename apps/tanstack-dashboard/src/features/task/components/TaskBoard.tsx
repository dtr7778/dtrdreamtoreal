import { TaskStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";
import type { TaskStatusEnumType } from "@workspace/drizzle/zod-db-enums";
import { Badge } from "@workspace/ui/components/badge";
import type { DragEndEvent } from "@workspace/ui/components/kibo-ui/kanban/index";
import {
  KanbanBoard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@workspace/ui/components/kibo-ui/kanban/index";

import { TASK_BOARD_COLUMNS } from "../task.constant";
import type { TaskBoardItem } from "../task.constant";
import { TaskKanbanCard } from "./TaskKanbanCard";

type TaskBoardColumn = (typeof TASK_BOARD_COLUMNS)[number];

export type TaskKanbanDatum<T extends TaskBoardItem> = {
  id: string;
  name: string;
  column: TaskStatusEnumType;
  task: T;
};

interface TaskBoardProps<T extends TaskBoardItem> {
  items: Array<T>;
  onStatusChange: (taskId: string, status: TaskStatusEnumType) => void;
  onEdit: (task: T) => void;
  onDelete: (task: T) => void;
}

export function TaskBoard<T extends TaskBoardItem>({
  items,
  onStatusChange,
  onEdit,
  onDelete,
}: TaskBoardProps<T>) {
  const data: Array<TaskKanbanDatum<T>> = items.map((task) => ({
    id: task.id,
    name: task.title,
    column: task.status,
    task,
  }));

  /**
   * Resolve the target column from the drop target rather than the kanban's
   * internal state: dropping on a column uses its id, dropping on a card uses
   * that card's status.
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const task = items.find((item) => item.id === String(active.id));
    if (!task) return;

    const overId = String(over.id);
    const targetStatus =
      TaskStatusEnumSchema.options.find((status) => status === overId) ??
      items.find((item) => item.id === overId)?.status;

    if (targetStatus && targetStatus !== task.status) {
      onStatusChange(task.id, targetStatus);
    }
  };

  return (
    <div className="overflow-x-auto p-1">
      <KanbanProvider<TaskKanbanDatum<T>, TaskBoardColumn>
        columns={TASK_BOARD_COLUMNS}
        data={data}
        onDragEnd={handleDragEnd}
        className="auto-cols-[minmax(17rem,1fr)] min-h-[60vh]"
      >
        {(column) => {
          const count = items.filter(
            (item) => item.status === column.id
          ).length;

          return (
            <KanbanBoard id={column.id} key={column.id}>
              <KanbanHeader className="flex items-center justify-between">
                <span>{column.name}</span>
                <Badge variant="secondary">{count}</Badge>
              </KanbanHeader>
              <KanbanCards<TaskKanbanDatum<T>> id={column.id}>
                {(item) => (
                  <TaskKanbanCard
                    key={item.id}
                    task={item.task}
                    cardId={item.id}
                    cardName={item.name}
                    cardColumn={item.column}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                )}
              </KanbanCards>
            </KanbanBoard>
          );
        }}
      </KanbanProvider>
    </div>
  );
}

import type { KeyboardEvent, MouseEvent } from "react";

import { useAuthStore } from "#/stores/zustand/auth/AuthStoreContext";
import { resolveUserImage } from "#/utils/resolveUserImage";
import { CalendarDays, Edit, Trash2 } from "lucide-react";

import {
  formatDateWithTimezone,
  formatEnumValue,
  strInitials,
} from "@workspace/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { KanbanCard } from "@workspace/ui/components/kibo-ui/kanban";
import { cn } from "@workspace/ui/lib/utils";

import type { TaskBoardItem } from "../task.constant";

const PRIORITY_VARIANT = {
  low: "outline",
  medium: "secondary",
  high: "default",
} as const;

const MAX_VISIBLE_ASSIGNEES = 3;

const STATUS_ACCENT = {
  todo: "before:bg-muted-foreground/40",
  in_progress: "before:bg-amber-500",
  done: "before:bg-emerald-500",
  cancelled: "before:bg-destructive",
} as const;

interface TaskCardProps<T extends TaskBoardItem> {
  task: T;
  cardId: string;
  cardName: string;
  cardColumn: string;
  onEdit: (task: T) => void;
  onDelete: (task: T) => void;
}

export function TaskKanbanCard<T extends TaskBoardItem>({
  task,
  cardId,
  cardName,
  cardColumn,
  onEdit,
  onDelete,
}: TaskCardProps<T>) {
  const user = useAuthStore((state) => state.user);

  const stopDrag = (event: MouseEvent | KeyboardEvent) => {
    event.stopPropagation();
  };

  const assignees = "assignees" in task ? task.assignees : [];
  const visibleAssignees = assignees.slice(0, MAX_VISIBLE_ASSIGNEES);
  const hiddenAssigneeCount = assignees.length - visibleAssignees.length;

  return (
    <KanbanCard
      id={cardId}
      name={cardName}
      column={cardColumn}
      className={cn(
        "relative overflow-hidden bg-card text-left outline-none transition-colors before:absolute before:inset-y-0 before:left-0 before:w-1 hover:border-foreground/20 hover:bg-accent/60",
        task.status === "cancelled" && "opacity-50",
        STATUS_ACCENT[task.status]
      )}
    >
      <div role="button" tabIndex={0} className="flex gap-1">
        <div className="flex flex-1 flex-col gap-2">
          <p
            className={cn(
              "line-clamp-2 text-sm leading-snug font-medium",
              task.status === "cancelled" && "line-through text-destructive"
            )}
          >
            {task.status === "done" && "✅"}
            {task.title}
          </p>

          {task.description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs mt-auto">
            <Badge variant={PRIORITY_VARIANT[task.priority]}>
              {formatEnumValue(task.priority)}
            </Badge>
            {task.source !== "manual" && (
              <Badge variant="outline">{formatEnumValue(task.source)}</Badge>
            )}
            {task.dueDate && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <CalendarDays className="size-3.5" />
                <time dateTime={task.dueDate.toISOString()}>
                  {formatDateWithTimezone(
                    task.dueDate,
                    "MMM dd",
                    user?.timezone
                  )}
                </time>
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            aria-label="Delete task"
            onMouseDown={stopDrag}
            onPointerDown={stopDrag}
            onClick={(event) => {
              event.stopPropagation();
              onDelete(task);
            }}
          >
            <Trash2 />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Update task"
            onMouseDown={stopDrag}
            onPointerDown={stopDrag}
            onClick={(event) => {
              event.stopPropagation();
              onEdit(task);
            }}
          >
            <Edit />
          </Button>
          {visibleAssignees.length > 0 && (
            <AvatarGroup>
              {visibleAssignees.map((assignee) => (
                <Avatar key={assignee.id} size="sm" title={assignee.name}>
                  <AvatarImage
                    src={resolveUserImage(assignee.image)}
                    alt={assignee.name}
                  />
                  <AvatarFallback className="text-[10px] font-semibold uppercase">
                    {strInitials(assignee.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {hiddenAssigneeCount > 0 && (
                <AvatarGroupCount>+{hiddenAssigneeCount}</AvatarGroupCount>
              )}
            </AvatarGroup>
          )}
        </div>
      </div>
    </KanbanCard>
  );
}

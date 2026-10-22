import type { TaskStatusEnumType } from "@workspace/drizzle/zod-db-enums";

type LifecycleState = {
  status: TaskStatusEnumType;
  startedAt: Date | null;
  completedAt: Date | null;
};

/**
 * Derives lifecycle timestamps from a status change. `startedAt` is set the
 * first time work begins and is kept afterwards; `completedAt` is set while the
 * task is done and cleared when it moves back out of that state.
 */
export function resolveLifecycleTimestamps(
  nextStatus: TaskStatusEnumType,
  current: LifecycleState | null,
  now: Date
) {
  const isStarted = nextStatus === "in_progress" || nextStatus === "done";

  return {
    startedAt: current?.startedAt ?? (isStarted ? now : null),
    completedAt: nextStatus === "done" ? (current?.completedAt ?? now) : null,
  };
}

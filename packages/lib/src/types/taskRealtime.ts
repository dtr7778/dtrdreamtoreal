export type TaskRealtimeScope = "company" | "personal";

export type TaskRealtimeAction = "created" | "updated" | "deleted";

export type TaskRealtimeChange = {
  scope: TaskRealtimeScope;
  action: TaskRealtimeAction;
  taskId: string;
  actorId: string;
};

export type TaskRealtimeAudience =
  { type: "all" } | { type: "users"; userIds: Array<string> };

export type TaskRealtimePublishPayload = {
  audience: TaskRealtimeAudience;
  change: TaskRealtimeChange;
};

export type TaskRealtimeClientEvent = { type: "ping" };

export type TaskRealtimeServerEvent =
  { type: "task_changed"; data: TaskRealtimeChange } | { type: "pong" };

import z from "zod";

import {
  TaskPriorityEnumSchema,
  TaskStatusEnumSchema,
} from "@workspace/drizzle/zod-db-enums";

export const taskCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(255, "Title is too long"),
  description: z.string().trim().optional(),
  priority: TaskPriorityEnumSchema,
  dueDate: z.date().nullish(),
  assignedBy: z.uuid().nullish(),
});
export type TaskCreateType = z.infer<typeof taskCreateSchema>;

export const taskUpdateSchema = taskCreateSchema.partial().extend({
  status: TaskStatusEnumSchema.optional(),
});
export type TaskUpdateType = z.infer<typeof taskUpdateSchema>;

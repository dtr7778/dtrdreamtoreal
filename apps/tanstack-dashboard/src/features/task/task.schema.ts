import z from "zod";

import {
  TaskPriorityEnumSchema,
  TaskStatusEnumSchema,
} from "@workspace/drizzle/zod-db-enums";

export const TASK_TITLE_MAX_LENGTH = 200;
export const TASK_DESCRIPTION_MAX_LENGTH = 5000;

export const companyTaskCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(
      TASK_TITLE_MAX_LENGTH,
      `Title must be ${TASK_TITLE_MAX_LENGTH} characters or fewer`
    ),
  description: z
    .string()
    .max(
      TASK_DESCRIPTION_MAX_LENGTH,
      `Description must be ${TASK_DESCRIPTION_MAX_LENGTH} characters or fewer`
    ),
  priority: TaskPriorityEnumSchema,
  dueDate: z.date().nullable(),
  assigneeIds: z.array(z.uuid()).default([]),
});
export type CompanyTaskCreateType = z.infer<typeof companyTaskCreateSchema>;

export const companyTaskUpdateSchema = companyTaskCreateSchema
  .omit({ assigneeIds: true })
  .extend({
    status: TaskStatusEnumSchema,
    assigneeIds: z.array(z.uuid()).optional(),
  })
  .partial();
export type CompanyTaskUpdateType = z.infer<typeof companyTaskUpdateSchema>;

export const personalTaskCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(
      TASK_TITLE_MAX_LENGTH,
      `Title must be ${TASK_TITLE_MAX_LENGTH} characters or fewer`
    ),
  description: z
    .string()
    .max(
      TASK_DESCRIPTION_MAX_LENGTH,
      `Description must be ${TASK_DESCRIPTION_MAX_LENGTH} characters or fewer`
    ),
  priority: TaskPriorityEnumSchema,
  dueDate: z.date().nullable(),
});
export type PersonalTaskCreateType = z.infer<typeof personalTaskCreateSchema>;

export const personalTaskUpdateSchema = personalTaskCreateSchema
  .extend({
    status: TaskStatusEnumSchema,
  })
  .partial();
export type PersonalTaskUpdateType = z.infer<typeof personalTaskUpdateSchema>;

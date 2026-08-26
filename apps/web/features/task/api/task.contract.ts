import z from "zod";

import { selectTaskSchema } from "@workspace/drizzle/schemas";
import {
  TaskPriorityEnumSchema,
  TaskStatusEnumSchema,
} from "@workspace/drizzle/zod-db-enums";
import {
  apiOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/utils";

import { API_MESSAGES } from "@/constants/apiMessage";
import { userProfileSchema } from "@/features/user/user.api-schema";
import { baseContract } from "@/server/orpc.contract-base";
import { InferContractRouterType } from "@/types/orpc.types";

import { taskCreateSchema, taskUpdateSchema } from "../task.schema";

const taskBaseContract = baseContract.errors({
  NOT_FOUND: {
    status: 404,
    success: false,
    message: API_MESSAGES.TASK.NOT_FOUND,
  },
});

const tags = ["Task"] as const;

const listTasksContract = taskBaseContract
  .route({
    path: "/tasks/list",
    description: "List of tasks",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectTaskSchema>({
      orderFields: ["dueDate", "createdAt"],
      searchFields: ["title"],
      filter: z.object({
        status: TaskStatusEnumSchema.optional(),
        priority: TaskPriorityEnumSchema.optional(),
        createdAt: z
          .object({
            from: z.date().describe("Created at from date").optional(),
            to: z.date().describe("Created at to date").optional(),
          })
          .optional(),
      }),
    })
  )
  .output(
    apiOutputZodSchema(
      paginateOutputZodSchema(
        selectTaskSchema
          .pick({
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            dueDate: true,
            createdAt: true,
            updatedAt: true,
          })
          .extend({
            assignedByUser: userProfileSchema.nullable(),
            createdByUser: userProfileSchema,
          })
      )
    )
  );
export type ListTaskContractType = InferContractRouterType<
  typeof listTasksContract
>;

const taskDetailsContract = taskBaseContract
  .route({
    path: "/tasks/details",
    description: "Task details",
    tags,
  })
  .input(z.object({ taskId: z.uuid() }))
  .output(
    apiOutputZodSchema(
      selectTaskSchema
        .pick({
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          dueDate: true,
          createdAt: true,
          updatedAt: true,
        })
        .extend({
          assignedByUser: userProfileSchema.nullable(),
          createdByUser: userProfileSchema,
        })
    )
  );
export type TaskDetailsContractType = InferContractRouterType<
  typeof taskDetailsContract
>;

const taskCreateContract = taskBaseContract
  .route({
    path: "/tasks/create",
    description: "Create a task",
    tags,
  })
  .input(taskCreateSchema)
  .output(
    apiOutputZodSchema(
      selectTaskSchema.pick({
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
      })
    )
  );
export type TaskCreateContractType = InferContractRouterType<
  typeof taskCreateContract
>;

const taskUpdateContract = taskBaseContract
  .route({
    path: "/tasks/update",
    description: "Update own task for system admins",
    tags,
  })
  .input(taskUpdateSchema.extend({ taskId: z.uuid() }))
  .output(
    apiOutputZodSchema(
      selectTaskSchema.pick({
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
      })
    )
  );
export type TaskUpdateContractType = InferContractRouterType<
  typeof taskUpdateContract
>;

const taskDeleteContract = taskBaseContract
  .route({
    path: "/tasks/delete",
    description: "Delete a task",
    tags,
  })
  .input(z.object({ taskId: z.uuid() }))
  .output(apiOutputZodSchema(z.null()));
export type TaskDeleteContractType = InferContractRouterType<
  typeof taskDeleteContract
>;

export const taskContract = {
  list: listTasksContract,
  details: taskDetailsContract,
  create: taskCreateContract,
  update: taskUpdateContract,
  delete: taskDeleteContract,
};

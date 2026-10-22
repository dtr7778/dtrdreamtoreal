import { API_MESSAGES } from "#/constants/apiMessage";
import { baseContract } from "#/server/orpc.contract-base";
import type { InferContractRouterType } from "#/types/orpc.types";
import z from "zod";

import { selectPersonalTaskSchema } from "@workspace/drizzle/schemas";
import { apiOutputSchema } from "@workspace/lib/zod-schemas";

import {
  personalTaskCreateSchema,
  personalTaskUpdateSchema,
} from "../task.schema";

const taskBaseContract = baseContract.errors({
  NOT_FOUND: {
    status: 404,
    success: false,
    message: API_MESSAGES.TASK.NOT_FOUND,
  },
});

const tags = ["Task"] as const;

const listPersonalTaskContract = taskBaseContract
  .route({
    method: "GET",
    path: "/task/personal/list",
    description: "List of personal tasks",
    tags,
  })
  .input(z.object({}))
  .output(
    apiOutputSchema(
      z.array(
        selectPersonalTaskSchema.pick({
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          dueDate: true,
          startedAt: true,
          completedAt: true,
          sortOrder: true,
          source: true,
          externalId: true,
          metadata: true,
          createdAt: true,
          updatedAt: true,
        })
      )
    )
  );
export type ListPersonalTaskContractType = InferContractRouterType<
  typeof listPersonalTaskContract
>;

const createPersonalTaskContract = taskBaseContract
  .route({
    method: "POST",
    path: "/task/personal/create",
    description: "Create a personal task",
    tags,
  })
  .input(personalTaskCreateSchema)
  .output(
    apiOutputSchema(
      selectPersonalTaskSchema.pick({
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        startedAt: true,
        completedAt: true,
        sortOrder: true,
        source: true,
        externalId: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      })
    )
  );
export type CreatePersonalTaskContractType = InferContractRouterType<
  typeof createPersonalTaskContract
>;

const updatePersonalTaksContract = taskBaseContract
  .route({
    method: "POST",
    path: "/task/personal/update",
    description: "Update one of the current user's personal tasks",
    tags,
  })
  .input(personalTaskUpdateSchema.extend({ taskId: z.uuid() }))
  .output(
    apiOutputSchema(
      selectPersonalTaskSchema.pick({
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        startedAt: true,
        completedAt: true,
        sortOrder: true,
        source: true,
        externalId: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      })
    )
  );
export type UpdatePersonalTaskContractType = InferContractRouterType<
  typeof updatePersonalTaksContract
>;

const removePersonalTaskContract = taskBaseContract
  .route({
    method: "POST",
    path: "/task/personal/delete",
    description: "Permanently delete one of the current user's personal tasks",
    tags,
  })
  .input(z.object({ taskId: z.uuid() }))
  .output(apiOutputSchema(z.null()));
export type RemovePersonalTaskContractType = InferContractRouterType<
  typeof removePersonalTaskContract
>;

export const personalTaskContract = {
  list: listPersonalTaskContract,
  create: createPersonalTaskContract,
  update: updatePersonalTaksContract,
  remove: removePersonalTaskContract,
};

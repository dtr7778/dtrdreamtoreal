import { API_MESSAGES } from "#/constants/apiMessage";
import { baseContract } from "#/server/orpc.contract-base";
import type { InferContractRouterType } from "#/types/orpc.types";
import z from "zod";

import { selectCompanyTaskSchema } from "@workspace/drizzle/schemas";
import { userProfileSchema } from "@workspace/lib/user-api-schema";
import { apiOutputSchema } from "@workspace/lib/zod-schemas";

import {
  companyTaskCreateSchema,
  companyTaskUpdateSchema,
} from "../task.schema";

const taskBaseContract = baseContract.errors({
  NOT_FOUND: {
    status: 404,
    success: false,
    message: API_MESSAGES.TASK.NOT_FOUND,
  },
  ASSIGNEE_NOT_FOUND: {
    status: 404,
    success: false,
    message: API_MESSAGES.TASK.ASSIGNEE_NOT_FOUND,
  },
});

const tags = ["Task"] as const;

const listCompanyTaskContract = taskBaseContract
  .route({
    method: "GET",
    path: "/task/company/list",
    description: "List company tasks visible to every user",
    tags,
  })
  .input(z.object({}))
  .output(
    apiOutputSchema(
      z.array(
        selectCompanyTaskSchema
          .pick({
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            dueDate: true,
            startedAt: true,
            completedAt: true,
            source: true,
            externalId: true,
            metadata: true,
            createdAt: true,
            updatedAt: true,
          })
          .extend({
            assignees: z.array(userProfileSchema),
            assignedByUser: userProfileSchema.nullable(),
            createdByUser: userProfileSchema.nullable(),
            updatedByUser: userProfileSchema.nullable(),
          })
      )
    )
  );
export type ListCompanyTaskContractType = InferContractRouterType<
  typeof listCompanyTaskContract
>;

const createCompanyTaskContract = taskBaseContract
  .route({
    method: "POST",
    path: "/task/company/create",
    description: "Create a company task",
    tags,
  })
  .input(companyTaskCreateSchema)
  .output(apiOutputSchema(selectCompanyTaskSchema));
export type CreateCompanyTaskContractType = InferContractRouterType<
  typeof createCompanyTaskContract
>;

const updateCompanyTaskContract = taskBaseContract
  .route({
    method: "POST",
    path: "/task/company/update",
    description: "Update a company task",
    tags,
  })
  .input(companyTaskUpdateSchema.extend({ taskId: z.uuid() }))
  .output(apiOutputSchema(selectCompanyTaskSchema));
export type UpdateCompanyTaskContractType = InferContractRouterType<
  typeof updateCompanyTaskContract
>;

const removeCompanyTaskContract = taskBaseContract
  .route({
    method: "POST",
    path: "/task/company/delete",
    description: "Permanently delete a company task",
    tags,
  })
  .input(z.object({ taskId: z.uuid() }))
  .output(apiOutputSchema(z.null()));
export type RemoveCompanyTaskContractType = InferContractRouterType<
  typeof removeCompanyTaskContract
>;

export const companyTaskContract = {
  list: listCompanyTaskContract,
  create: createCompanyTaskContract,
  update: updateCompanyTaskContract,
  remove: removeCompanyTaskContract,
};

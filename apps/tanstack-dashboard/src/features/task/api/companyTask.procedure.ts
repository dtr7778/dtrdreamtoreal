import { API_MESSAGES } from "#/constants/apiMessage";
import { ORPCError } from "@orpc/client";
import { eq, inArray } from "drizzle-orm";

import type { DatabaseType } from "@workspace/drizzle/client";
import {
  CompanyTaskAssigneeTable,
  CompanyTaskTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import type { UpdateCompanyTask } from "@workspace/drizzle/schemas";
import { apiResponse } from "@workspace/lib/utils";

import { publishTaskChange } from "../task.realtime.server";
import { resolveLifecycleTimestamps } from "../task.status";
import { buildCompanyTaskListQuery } from "./companyTask.query";
import { taskImpl } from "./task.procedure";

async function usersExist(db: DatabaseType, userIds: Array<string>) {
  const users = await db
    .select({ id: UserTable.id })
    .from(UserTable)
    .where(inArray(UserTable.id, userIds));

  return users.length === userIds.length;
}

export const listCompanyTaskProcedure = taskImpl.company.list.handler(
  async ({ context }) => {
    const tasks = await buildCompanyTaskListQuery(context.db);

    return apiResponse(API_MESSAGES.TASK.GET_COMPANY, tasks);
  }
);

export const createCompanyTaskProcedure = taskImpl.company.create.handler(
  async ({ context, input, errors }) => {
    const userId = context.user.id;
    const assigneeIds = [...new Set(input.assigneeIds)];

    if (assigneeIds.length > 0 && !(await usersExist(context.db, assigneeIds))) {
      throw errors.ASSIGNEE_NOT_FOUND();
    }

    const lifecycle = resolveLifecycleTimestamps("todo", null, new Date());

    const [newTask] = await context.db
      .insert(CompanyTaskTable)
      .values({
        title: input.title,
        description: input.description ?? null,
        status: "todo",
        source: "manual",
        priority: input.priority,
        dueDate: input.dueDate ?? null,
        startedAt: lifecycle.startedAt,
        completedAt: lifecycle.completedAt,
        assignedById: assigneeIds.length > 0 ? userId : null,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();

    if (!newTask) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.TASK.NOT_CREATE,
      });
    }

    if (assigneeIds.length > 0) {
      await context.db
        .insert(CompanyTaskAssigneeTable)
        .values(assigneeIds.map((id) => ({ taskId: newTask.id, userId: id })));
    }

    await publishTaskChange(
      { type: "all" },
      {
        scope: "company",
        action: "created",
        taskId: newTask.id,
        actorId: userId,
      }
    );

    return apiResponse(API_MESSAGES.TASK.CREATE_COMPANY, newTask);
  }
);

export const updateCompanyTaskProcedure = taskImpl.company.update.handler(
  async ({ context, input, errors }) => {
    const userId = context.user.id;
    const { taskId, ...patch } = input;

    const [existing] = await context.db
      .select({
        status: CompanyTaskTable.status,
        startedAt: CompanyTaskTable.startedAt,
        completedAt: CompanyTaskTable.completedAt,
        assignedById: CompanyTaskTable.assignedById,
      })
      .from(CompanyTaskTable)
      .where(eq(CompanyTaskTable.id, taskId))
      .limit(1);

    if (!existing) {
      throw errors.NOT_FOUND();
    }

    const currentAssignees = await context.db
      .select({ userId: CompanyTaskAssigneeTable.userId })
      .from(CompanyTaskAssigneeTable)
      .where(eq(CompanyTaskAssigneeTable.taskId, taskId));

    const nextAssigneeIds =
      patch.assigneeIds !== undefined
        ? [...new Set(patch.assigneeIds)]
        : undefined;

    if (
      nextAssigneeIds &&
      nextAssigneeIds.length > 0 &&
      !(await usersExist(context.db, nextAssigneeIds))
    ) {
      throw errors.ASSIGNEE_NOT_FOUND();
    }

    const values: UpdateCompanyTask = {
      updatedBy: userId,
    };

    if (patch.title !== undefined) values.title = patch.title;
    if (patch.description !== undefined)
      values.description = patch.description ?? null;
    if (patch.priority !== undefined) values.priority = patch.priority;
    if (patch.dueDate !== undefined) values.dueDate = patch.dueDate ?? null;

    if (patch.status !== undefined) {
      const lifecycle = resolveLifecycleTimestamps(
        patch.status,
        existing,
        new Date()
      );
      values.status = patch.status;
      values.startedAt = lifecycle.startedAt;
      values.completedAt = lifecycle.completedAt;
    }

    if (nextAssigneeIds !== undefined) {
      const previous = currentAssignees.map((assignee) => assignee.userId).sort();
      const next = [...nextAssigneeIds].sort();
      const unchanged =
        previous.length === next.length &&
        previous.every((id, index) => id === next[index]);

      values.assignedById =
        nextAssigneeIds.length === 0
          ? null
          : unchanged
            ? existing.assignedById
            : userId;
    }

    const [updatedTask] = await context.db
      .update(CompanyTaskTable)
      .set(values)
      .where(eq(CompanyTaskTable.id, taskId))
      .returning();

    if (!updatedTask) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.TASK.NOT_UPDATE,
      });
    }

    if (nextAssigneeIds !== undefined) {
      await context.db
        .delete(CompanyTaskAssigneeTable)
        .where(eq(CompanyTaskAssigneeTable.taskId, taskId));

      if (nextAssigneeIds.length > 0) {
        await context.db
          .insert(CompanyTaskAssigneeTable)
          .values(nextAssigneeIds.map((id) => ({ taskId, userId: id })));
      }
    }

    await publishTaskChange(
      { type: "all" },
      { scope: "company", action: "updated", taskId, actorId: userId }
    );

    return apiResponse(API_MESSAGES.TASK.UPDATE_COMPANY, updatedTask);
  }
);

export const removeCompanyTaskProcedure = taskImpl.company.remove.handler(
  async ({ context, input, errors }) => {
    const userId = context.user.id;

    const deleted = await context.db
      .delete(CompanyTaskTable)
      .where(eq(CompanyTaskTable.id, input.taskId))
      .returning({ id: CompanyTaskTable.id });

    if (deleted.length === 0) {
      throw errors.NOT_FOUND();
    }

    await publishTaskChange(
      { type: "all" },
      {
        scope: "company",
        action: "deleted",
        taskId: input.taskId,
        actorId: userId,
      }
    );

    return apiResponse(API_MESSAGES.TASK.DELETE_COMPANY, null);
  }
);

import { API_MESSAGES } from "#/constants/apiMessage";
import { ORPCError } from "@orpc/client";
import { and, asc, desc, eq, sql } from "drizzle-orm";

import { PersonalTaskTable } from "@workspace/drizzle/schemas";
import { apiResponse } from "@workspace/lib/utils";

import { resolveLifecycleTimestamps } from "../task.status";
import { taskImpl } from "./task.procedure";

export const listPersonalTaskProcedure = taskImpl.personal.list.handler(
  async ({ context }) => {
    const rows = await context.db
      .select({
        id: PersonalTaskTable.id,
        title: PersonalTaskTable.title,
        description: PersonalTaskTable.description,
        status: PersonalTaskTable.status,
        priority: PersonalTaskTable.priority,
        dueDate: PersonalTaskTable.dueDate,
        startedAt: PersonalTaskTable.startedAt,
        completedAt: PersonalTaskTable.completedAt,
        sortOrder: PersonalTaskTable.sortOrder,
        source: PersonalTaskTable.source,
        externalId: PersonalTaskTable.externalId,
        metadata: PersonalTaskTable.metadata,
        createdAt: PersonalTaskTable.createdAt,
        updatedAt: PersonalTaskTable.updatedAt,
      })
      .from(PersonalTaskTable)
      .where(eq(PersonalTaskTable.userId, context.user.id))
      .orderBy(
        asc(PersonalTaskTable.sortOrder),
        desc(PersonalTaskTable.createdAt)
      );

    return apiResponse(API_MESSAGES.TASK.GET_PERSONAL, rows);
  }
);

export const createPersonalTaskProcedure = taskImpl.personal.create.handler(
  async ({ context, input }) => {
    const userId = context.user.id;

    const [sortRow] = await context.db
      .select({
        nextSortOrder: sql<number>`coalesce(max(${PersonalTaskTable.sortOrder}), -1) + 1`,
      })
      .from(PersonalTaskTable)
      .where(eq(PersonalTaskTable.userId, userId));

    const lifecycle = resolveLifecycleTimestamps("todo", null, new Date());

    const [newTask] = await context.db
      .insert(PersonalTaskTable)
      .values({
        userId,
        title: input.title,
        description: input.description ?? null,
        status: "todo",
        source: "manual",
        priority: input.priority,
        dueDate: input.dueDate ?? null,
        startedAt: lifecycle.startedAt,
        completedAt: lifecycle.completedAt,
        sortOrder: sortRow?.nextSortOrder ?? 0,
      })
      .returning();

    if (!newTask) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.TASK.NOT_CREATE,
      });
    }

    return apiResponse(API_MESSAGES.TASK.CREATE_PERSONAL, newTask);
  }
);

export const updatePersonalTaskProcedure = taskImpl.personal.update.handler(
  async ({ context, input, errors }) => {
    const userId = context.user.id;
    const { taskId, ...patch } = input;

    const [existing] = await context.db
      .select({
        status: PersonalTaskTable.status,
        startedAt: PersonalTaskTable.startedAt,
        completedAt: PersonalTaskTable.completedAt,
      })
      .from(PersonalTaskTable)
      .where(
        and(
          eq(PersonalTaskTable.id, taskId),
          eq(PersonalTaskTable.userId, userId)
        )
      )
      .limit(1);

    if (!existing) {
      throw errors.NOT_FOUND();
    }

    const values: Partial<typeof PersonalTaskTable.$inferInsert> = {};

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

    const [updatedTask] = await context.db
      .update(PersonalTaskTable)
      .set(values)
      .where(
        and(
          eq(PersonalTaskTable.id, taskId),
          eq(PersonalTaskTable.userId, userId)
        )
      )
      .returning();

    if (!updatedTask) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.TASK.NOT_UPDATE,
      });
    }

    return apiResponse(API_MESSAGES.TASK.UPDATE_PERSONAL, updatedTask);
  }
);

export const removePersonalTaskProcedure = taskImpl.personal.remove.handler(
  async ({ context, input, errors }) => {
    const userId = context.user.id;

    const deleted = await context.db
      .delete(PersonalTaskTable)
      .where(
        and(
          eq(PersonalTaskTable.id, input.taskId),
          eq(PersonalTaskTable.userId, userId)
        )
      )
      .returning({ id: PersonalTaskTable.id });

    if (deleted.length === 0) {
      throw errors.NOT_FOUND();
    }

    return apiResponse(API_MESSAGES.TASK.DELETE_PERSONAL, null);
  }
);

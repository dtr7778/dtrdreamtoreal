import { implement, ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  InsertTask,
  RoleTable,
  TaskTable,
  UpdateTask,
  UserRoleTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import { jsonbAgg } from "@workspace/drizzle/sql-helpers";
import { apiResponse } from "@workspace/lib/utils";

import { API_MESSAGES } from "@/constants/apiMessage";
import { sendNotification } from "@/features/notification/data/sendNotification";
import {
  authMiddleware,
  userPermissionMiddleware,
} from "@/server/middleware/auth.middleware";
import { errorMiddleware } from "@/server/middleware/error.middleware";
import { privateRateLimitMiddleware } from "@/server/middleware/rateLimit.middleware";
import { ORPCContext } from "@/types/orpc.types";

import { taskContract } from "./task.contract";

const AssignedUser = alias(UserTable, "assigned_user");
const CreatedUser = alias(UserTable, "created_user");

const AssignedUserRoleJoin = alias(UserRoleTable, "assigned_user_role_join");
const CreatedUserRoleJoin = alias(UserRoleTable, "created_user_role_join");

const AssignedUserRole = alias(RoleTable, "assigned_user_role");
const CreatedUserRole = alias(RoleTable, "created_user_role");

export const taskImpl = implement(taskContract)
  .$context<ORPCContext>()
  .use(errorMiddleware)
  .use(privateRateLimitMiddleware)
  .use(authMiddleware);

export const listTasksProcedure = taskImpl.list
  .use(userPermissionMiddleware(["system.task.manage", "system.task.list"]))
  .handler(async ({ context, input }) => {
    const { where, orderBy, offset, page, limit } = buildPaginateOptions(
      {
        title: TaskTable.title,
        status: TaskTable.status,
        priority: TaskTable.priority,
        dueDate: TaskTable.dueDate,
        createdAt: TaskTable.createdAt,
      },
      input
    );

    const joindedQuery = context.db
      .select({
        id: TaskTable.id,
        title: TaskTable.title,
        description: TaskTable.description,
        status: TaskTable.status,
        priority: TaskTable.priority,
        dueDate: TaskTable.dueDate,
        createdAt: TaskTable.createdAt,
        updatedAt: TaskTable.updatedAt,
        assignedByUser: {
          id: AssignedUser.id,
          name: AssignedUser.name,
          email: AssignedUser.email,
          image: AssignedUser.image,
          roles: jsonbAgg({
            id: AssignedUserRole.id,
            roleName: AssignedUserRole.roleName,
          }).as("assigned_user_roles"),
        },
        createdByUser: {
          id: CreatedUser.id,
          name: CreatedUser.name,
          email: CreatedUser.email,
          image: CreatedUser.image,
          roles: jsonbAgg({
            id: CreatedUserRole.id,
            roleName: CreatedUserRole.roleName,
          }).as("created_user_roles"),
        },
      })
      .from(TaskTable)
      .innerJoin(CreatedUser, eq(CreatedUser.id, TaskTable.createdBy))
      .innerJoin(
        CreatedUserRoleJoin,
        eq(CreatedUserRoleJoin.userId, CreatedUser.id)
      )
      .innerJoin(
        CreatedUserRole,
        eq(CreatedUserRole.id, CreatedUserRoleJoin.roleId)
      )
      .leftJoin(AssignedUser, eq(AssignedUser.id, TaskTable.assignedBy))
      .leftJoin(
        AssignedUserRoleJoin,
        eq(AssignedUserRoleJoin.userId, AssignedUser.id)
      )
      .leftJoin(
        AssignedUserRole,
        eq(AssignedUserRole.id, AssignedUserRoleJoin.roleId)
      )
      .where(where)
      .groupBy(TaskTable.id, AssignedUser.id, CreatedUser.id)
      .$dynamic();

    const [totalCount, tasks] = await Promise.all([
      context.db.$count(
        context.db.select({ id: TaskTable.id }).from(TaskTable)
      ),
      joindedQuery.orderBy(orderBy).limit(limit).offset(offset),
    ]);

    const meta = buildPaginationMeta(totalCount, tasks.length, page, limit);

    return apiResponse(API_MESSAGES.TASK.GET_ALL, {
      meta,
      data: tasks,
    });
  });

export const taskDetailsProcedure = taskImpl.details
  .use(userPermissionMiddleware(["system.task.manage", "system.task.read"]))
  .handler(async ({ context, input, errors }) => {
    const [taskData] = await context.db
      .select({
        id: TaskTable.id,
        title: TaskTable.title,
        description: TaskTable.description,
        status: TaskTable.status,
        priority: TaskTable.priority,
        dueDate: TaskTable.dueDate,
        createdAt: TaskTable.createdAt,
        updatedAt: TaskTable.updatedAt,
        assignedByUser: {
          id: AssignedUser.id,
          name: AssignedUser.name,
          email: AssignedUser.email,
          image: AssignedUser.image,
          roles: jsonbAgg({
            id: AssignedUserRole.id,
            roleName: AssignedUserRole.roleName,
          }).as("assigned_user_roles"),
        },
        createdByUser: {
          id: CreatedUser.id,
          name: CreatedUser.name,
          email: CreatedUser.email,
          image: CreatedUser.image,
          roles: jsonbAgg({
            id: CreatedUserRole.id,
            roleName: CreatedUserRole.roleName,
          }).as("created_user_roles"),
        },
      })
      .from(TaskTable)
      .leftJoin(AssignedUser, eq(AssignedUser.id, TaskTable.assignedBy))
      .leftJoin(
        AssignedUserRoleJoin,
        eq(AssignedUserRoleJoin.userId, AssignedUser.id)
      )
      .leftJoin(
        AssignedUserRole,
        eq(AssignedUserRole.id, AssignedUserRoleJoin.roleId)
      )
      .innerJoin(CreatedUser, eq(CreatedUser.id, TaskTable.createdBy))
      .innerJoin(
        CreatedUserRoleJoin,
        eq(CreatedUserRoleJoin.userId, CreatedUser.id)
      )
      .innerJoin(
        CreatedUserRole,
        eq(CreatedUserRole.id, CreatedUserRoleJoin.roleId)
      )
      .where(eq(TaskTable.id, input.taskId))
      .limit(1);

    if (!taskData) throw errors.NOT_FOUND();

    return apiResponse(API_MESSAGES.TASK.GET_DETAILS, taskData);
  });

export const taskCreateProcedure = taskImpl.create
  .use(userPermissionMiddleware(["system.task.manage", "system.task.create"]))
  .handler(async ({ context, input }) => {
    let assignedBy: string | null = null;

    if (input.assignedBy) {
      const [existUser] = await context.db
        .select({ id: UserTable.id })
        .from(UserTable)
        .where(eq(UserTable.id, input.assignedBy))
        .limit(1);
      if (existUser) {
        assignedBy = existUser.id;
      }
    }
    const [task] = await context.db
      .insert(TaskTable)
      .values({
        title: input.title,
        description: input.description,
        status: "todo",
        priority: input.priority,
        dueDate: input.dueDate,
        assignedBy: assignedBy,
        createdBy: context.user.id,
      } satisfies InsertTask)
      .returning({
        id: TaskTable.id,
        title: TaskTable.title,
        description: TaskTable.description,
        status: TaskTable.status,
        priority: TaskTable.priority,
        dueDate: TaskTable.dueDate,
        createdAt: TaskTable.createdAt,
        updatedAt: TaskTable.updatedAt,
      });

    if (!task) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.TASK.NOT_CREATE,
      });
    }

    if (assignedBy) {
      await sendNotification({
        database: context.db,
        supabaseClient: context.supabaseClient,
        payload: {
          category: "SYSTEM",
          title: "New Task",
          message: "New task assigned",
          recipientId: assignedBy,
          actorId: context.user.id,
          level: "INFO",
        },
      });
    }

    return apiResponse(API_MESSAGES.TASK.CREATE, task);
  });

export const taskUpdateProcedure = taskImpl.update
  .use(userPermissionMiddleware(["system.task.manage", "system.task.update"]))
  .handler(async ({ context, input, errors }) => {
    const { taskId, ...restInput } = input;

    const [taskData] = await context.db
      .select({ id: TaskTable.id })
      .from(TaskTable)
      .where(eq(TaskTable.id, taskId))
      .limit(1);

    if (!taskData) throw errors.NOT_FOUND();

    const set: UpdateTask = {};

    if (restInput.title !== undefined) set.title = restInput.title;
    if (restInput.description !== undefined)
      set.description = restInput.description;
    if (restInput.status !== undefined) set.status = restInput.status;
    if (restInput.priority !== undefined) set.priority = restInput.priority;
    if (restInput.dueDate !== undefined) set.dueDate = restInput.dueDate;

    const [updatedData] = await context.db
      .update(TaskTable)
      .set(set)
      .where(eq(TaskTable.id, taskId))
      .returning({
        id: TaskTable.id,
        title: TaskTable.title,
        description: TaskTable.description,
        status: TaskTable.status,
        priority: TaskTable.priority,
        dueDate: TaskTable.dueDate,
        createdAt: TaskTable.createdAt,
        updatedAt: TaskTable.updatedAt,
      });

    if (!updatedData) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.TASK.NOT_UPDATE,
      });
    }

    return apiResponse(API_MESSAGES.TASK.UPDATE, updatedData);
  });

export const taskDeleteProcedure = taskImpl.delete
  .use(userPermissionMiddleware(["system.task.manage", "system.task.delete"]))
  .handler(async ({ context, input, errors }) => {
    const [taskData] = await context.db
      .select({ id: TaskTable.id })
      .from(TaskTable)
      .where(eq(TaskTable.id, input.taskId))
      .limit(1);

    if (!taskData) throw errors.NOT_FOUND();

    await context.db.delete(TaskTable).where(eq(TaskTable.id, taskData.id));

    return apiResponse(API_MESSAGES.TASK.DELETE, null);
  });

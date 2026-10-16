import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";

import type { DatabaseType } from "@workspace/drizzle/client";
import {
  CompanyTaskAssigneeTable,
  CompanyTaskTable,
  RoleTable,
  UserRoleTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import { jsonGroupArrayDistinct } from "@workspace/drizzle/sql-helpers";

const AssigneeUser = alias(UserTable, "assignee_user");
const AssigneeUserRoleJoin = alias(UserRoleTable, "assignee_user_role_join");
const AssigneeUserRole = alias(RoleTable, "assignee_user_role");

const AssignedByUser = alias(UserTable, "assigned_by_user");
const AssignedByUserRoleJoin = alias(
  UserRoleTable,
  "assigned_by_user_role_join"
);
const AssignedByUserRole = alias(RoleTable, "assigned_by_user_role");

const CreatedByUser = alias(UserTable, "created_by_user");
const CreatedByUserRoleJoin = alias(UserRoleTable, "created_by_user_role_join");
const CreatedByUserRole = alias(RoleTable, "created_by_user_role");

const UpdatedByUser = alias(UserTable, "updated_by_user");
const UpdatedByUserRoleJoin = alias(UserRoleTable, "updated_by_user_role_join");
const UpdatedByUserRole = alias(RoleTable, "updated_by_user_role");

/**
 * Lists company tasks with the users around them (assignees, assigner, creator,
 * updater) and each user's roles. Kept separate from the handler so the SQL
 * shape can be exercised against a real SQLite database in tests.
 *
 * Assignees are aggregated as a distinct list (a user joined once per role would
 * otherwise repeat), and each assignee's roles are attached by matching user id
 * after the query returns.
 */
export async function buildCompanyTaskListQuery(db: DatabaseType) {
  const rows = await db
    .select({
      id: CompanyTaskTable.id,
      title: CompanyTaskTable.title,
      description: CompanyTaskTable.description,
      status: CompanyTaskTable.status,
      priority: CompanyTaskTable.priority,
      dueDate: CompanyTaskTable.dueDate,
      startedAt: CompanyTaskTable.startedAt,
      completedAt: CompanyTaskTable.completedAt,
      source: CompanyTaskTable.source,
      externalId: CompanyTaskTable.externalId,
      metadata: CompanyTaskTable.metadata,
      createdAt: CompanyTaskTable.createdAt,
      updatedAt: CompanyTaskTable.updatedAt,
      assignees: jsonGroupArrayDistinct(
        {
          id: AssigneeUser.id,
          name: AssigneeUser.name,
          email: AssigneeUser.email,
          image: AssigneeUser.image,
          assignedAt: CompanyTaskAssigneeTable.assignedAt,
        },
        AssigneeUser.id
      ).as("assignees"),
      assigneeRoles: jsonGroupArrayDistinct(
        {
          userId: AssigneeUserRoleJoin.userId,
          id: AssigneeUserRole.id,
          roleName: AssigneeUserRole.roleName,
        },
        AssigneeUserRole.id
      ).as("assignee_roles"),
      assignedByUser: {
        id: AssignedByUser.id,
        name: AssignedByUser.name,
        email: AssignedByUser.email,
        image: AssignedByUser.image,
        roles: jsonGroupArrayDistinct(
          {
            id: AssignedByUserRole.id,
            roleName: AssignedByUserRole.roleName,
          },
          AssignedByUserRole.id
        ).as("assigned_by_user_roles"),
      },
      createdByUser: {
        id: CreatedByUser.id,
        name: CreatedByUser.name,
        email: CreatedByUser.email,
        image: CreatedByUser.image,
        roles: jsonGroupArrayDistinct(
          {
            id: CreatedByUserRole.id,
            roleName: CreatedByUserRole.roleName,
          },
          CreatedByUserRole.id
        ).as("created_by_user_roles"),
      },
      updatedByUser: {
        id: UpdatedByUser.id,
        name: UpdatedByUser.name,
        email: UpdatedByUser.email,
        image: UpdatedByUser.image,
        roles: jsonGroupArrayDistinct(
          {
            id: UpdatedByUserRole.id,
            roleName: UpdatedByUserRole.roleName,
          },
          UpdatedByUserRole.id
        ).as("updated_by_user_roles"),
      },
    })
    .from(CompanyTaskTable)
    // assignees
    .leftJoin(
      CompanyTaskAssigneeTable,
      eq(CompanyTaskAssigneeTable.taskId, CompanyTaskTable.id)
    )
    .leftJoin(AssigneeUser, eq(AssigneeUser.id, CompanyTaskAssigneeTable.userId))
    .leftJoin(
      AssigneeUserRoleJoin,
      eq(AssigneeUserRoleJoin.userId, AssigneeUser.id)
    )
    .leftJoin(
      AssigneeUserRole,
      eq(AssigneeUserRole.id, AssigneeUserRoleJoin.roleId)
    )
    // assignedBy
    .leftJoin(
      AssignedByUser,
      eq(AssignedByUser.id, CompanyTaskTable.assignedById)
    )
    .leftJoin(
      AssignedByUserRoleJoin,
      eq(AssignedByUserRoleJoin.userId, AssignedByUser.id)
    )
    .leftJoin(
      AssignedByUserRole,
      eq(AssignedByUserRole.id, AssignedByUserRoleJoin.roleId)
    )
    // createdBy
    .leftJoin(CreatedByUser, eq(CreatedByUser.id, CompanyTaskTable.createdBy))
    .leftJoin(
      CreatedByUserRoleJoin,
      eq(CreatedByUserRoleJoin.userId, CreatedByUser.id)
    )
    .leftJoin(
      CreatedByUserRole,
      eq(CreatedByUserRole.id, CreatedByUserRoleJoin.roleId)
    )
    // updatedBy
    .leftJoin(UpdatedByUser, eq(UpdatedByUser.id, CompanyTaskTable.updatedBy))
    .leftJoin(
      UpdatedByUserRoleJoin,
      eq(UpdatedByUserRoleJoin.userId, UpdatedByUser.id)
    )
    .leftJoin(
      UpdatedByUserRole,
      eq(UpdatedByUserRole.id, UpdatedByUserRoleJoin.roleId)
    )
    .groupBy(CompanyTaskTable.id)
    .orderBy(desc(CompanyTaskTable.updatedAt));

  return rows.map(({ assignees, assigneeRoles, ...task }) => ({
    ...task,
    assignees: assignees
      .slice()
      .sort((a, b) => Number(a.assignedAt) - Number(b.assignedAt))
      .map((assignee) => ({
        id: assignee.id,
        name: assignee.name,
        email: assignee.email,
        image: assignee.image,
        roles: assigneeRoles
          .filter((role) => role.userId === assignee.id)
          .map((role) => ({ id: role.id, roleName: role.roleName })),
      })),
  }));
}

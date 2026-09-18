import { eq, max } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { inject } from "inversify";

import { contracts, type ContractsType } from "@workspace/contract";
import type { DatabaseType } from "@workspace/drizzle/client";
import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  RoleTable,
  UserActivityTable,
  UserRoleTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import { jsonbAgg } from "@workspace/drizzle/sql-helpers";
import {
  ApiErrorFilter,
  ApiResponse,
  Controller,
  Get,
  RequestValidator,
  UseFilters,
} from "@workspace/lib/server";

import { CONTAINER_TYPES } from "@/container/container-types";

export interface IUserController {
  getAllUser(
    input: ContractsType["user"]["list"]["input"]
  ): Promise<ContractsType["user"]["list"]["output"]>;
}

@Controller({
  path: "/users",
  scope: "Singleton",
  tags: ["Users"],
})
@UseFilters(ApiErrorFilter)
export class UserController implements IUserController {
  constructor(
    @inject(CONTAINER_TYPES.Drizzle)
    private readonly db: DatabaseType
  ) {}

  @Get("/", contracts.user.list)
  public async getAllUser(
    @RequestValidator(contracts.user.list.input)
    { query }: ContractsType["user"]["list"]["input"]
  ): Promise<ContractsType["user"]["list"]["output"]> {
    console.log(query);
    const { offset, limit, where, orderBy, page } = buildPaginateOptions(
      {
        name: UserTable.name,
        email: UserTable.email,
        emailVerified: UserTable.emailVerified,
        createdAt: UserTable.createdAt,
      },
      query
    );

    const lastLoginSq = this.db
      .select({
        userId: UserActivityTable.userId,
        lastLogin: max(UserActivityTable.loginAt).as("last_login"),
      })
      .from(UserActivityTable)
      .groupBy(UserActivityTable.userId)
      .as("last_login_sq");

    const joinedQuery = this.db
      .select({
        id: UserTable.id,
        name: UserTable.name,
        email: UserTable.email,
        emailVerified: UserTable.emailVerified,
        image: UserTable.image,
        role: UserTable.role,
        roles: jsonbAgg({
          id: RoleTable.id,
          roleName: RoleTable.roleName,
        }).as("roles"),
        banned: UserTable.banned,
        banReason: UserTable.banReason,
        banExpires: UserTable.banExpires,
        timezone: UserTable.timezone,
        locale: UserTable.locale,
        currency: UserTable.currency,
        createdAt: UserTable.createdAt,
        updatedAt: UserTable.updatedAt,
        lastLogin: lastLoginSq.lastLogin,
      })
      .from(UserTable)
      .leftJoin(lastLoginSq, eq(lastLoginSq.userId, UserTable.id))
      .innerJoin(UserRoleTable, eq(UserRoleTable.userId, UserTable.id))
      .innerJoin(RoleTable, eq(UserRoleTable.roleId, RoleTable.id))
      .where(where)
      .groupBy(UserTable.id, lastLoginSq.lastLogin);

    const [totalCount, users] = await Promise.all([
      this.db.$count(UserTable),
      joinedQuery.orderBy(orderBy).limit(limit).offset(offset),
    ]);

    const meta = buildPaginationMeta(totalCount, users.length, page, limit);

    return new ApiResponse({
      statusCode: StatusCodes.OK,
      message: "User fetched successfully",
      data: { meta, data: users },
    });
  }
}

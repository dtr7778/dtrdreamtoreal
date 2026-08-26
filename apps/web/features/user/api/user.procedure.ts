import { implement, ORPCError } from "@orpc/server";
import { and, countDistinct, eq, gte, inArray, lte, max } from "drizzle-orm";

import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  FileTable,
  RoleTable,
  UserActivityTable,
  UserRoleTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import { apiResponse, prepareExport } from "@workspace/lib/utils";

import { auth } from "@/lib/better-auth/auth";
import { resolveFileUrl } from "@/lib/resolveFileUrl";

import { API_MESSAGES } from "@/constants/apiMessage";
import {
  authMiddleware,
  userPermissionMiddleware,
  userRoleMiddleware,
} from "@/server/middleware/auth.middleware";
import { errorMiddleware } from "@/server/middleware/error.middleware";
import { privateRateLimitMiddleware } from "@/server/middleware/rateLimit.middleware";
import { ORPCContext } from "@/types/orpc.types";

import { roleColumnSql, userProfileColumns } from "../user.api-schema";
import { userContract } from "./user.contract";

export const userImpl = implement(userContract)
  .$context<ORPCContext>()
  .use(errorMiddleware)
  .use(privateRateLimitMiddleware)
  .use(authMiddleware);

export const listUserProcedure = userImpl.list
  .use(userPermissionMiddleware(["system.user.manage", "system.user.list"]))
  .handler(async ({ context, input }) => {
    const { where, orderBy, limit, offset, page } = buildPaginateOptions(
      {
        name: UserTable.name,
        email: UserTable.email,
        createdAt: UserTable.createdAt,
        updatedAt: UserTable.updatedAt,
      },
      input
    );

    const lastLoginSq = context.db
      .select({
        userId: UserActivityTable.userId,
        lastLogin: max(UserActivityTable.loginAt).as("last_login"),
      })
      .from(UserActivityTable)
      .groupBy(UserActivityTable.userId)
      .as("last_login_sq");

    const joinedQuery = context.db
      .select({
        id: UserTable.id,
        name: UserTable.name,
        email: UserTable.email,
        emailVerified: UserTable.emailVerified,
        image: UserTable.image,
        role: UserTable.role,
        roles: roleColumnSql,
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
      context.db.$count(UserTable),
      joinedQuery.orderBy(orderBy).limit(limit).offset(offset),
    ]);

    const meta = buildPaginationMeta(totalCount, users.length, page, limit);

    return apiResponse(API_MESSAGES.USER.GET_ALL, { meta, data: users });
  });

export const userDataExportProcedure = userImpl.export
  .use(userPermissionMiddleware(["system.user.manage", "system.user.list"]))
  .handler(async ({ context, input }) => {
    const { where, orderBy } = buildPaginateOptions(
      {
        name: UserTable.name,
        email: UserTable.email,
        createdAt: UserTable.createdAt,
        updatedAt: UserTable.updatedAt,
      },
      input
    );

    const lastLoginSq = context.db
      .select({
        userId: UserActivityTable.userId,
        lastLogin: max(UserActivityTable.loginAt).as("last_login"),
      })
      .from(UserActivityTable)
      .groupBy(UserActivityTable.userId)
      .as("last_login_sq");

    const results = await context.db
      .select({
        id: UserTable.id,
        name: UserTable.name,
        email: UserTable.email,
        emailVerified: UserTable.emailVerified,
        image: UserTable.image,
        role: UserTable.role,
        roles: roleColumnSql,
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
      .groupBy(UserTable.id, lastLoginSq.lastLogin)
      .orderBy(orderBy);

    const exportData = prepareExport(results, input.format, {
      prefix: "user",
    });

    return apiResponse(API_MESSAGES.USER.EXPORT, exportData);
  });

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function calcGrowth(previous: number, current: number): number | null {
  if (previous === 0) return null; // avoid division by zero — no data last period
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export const userStatsProcedure = userImpl.stats
  .use(userRoleMiddleware(["ADMIN", "SUPER_ADMIN"]))
  .handler(async ({ context }) => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const thisWeekStart = daysAgo(7);
    const lastWeekStart = daysAgo(14);
    const thisMonthStart = daysAgo(30);
    const lastMonthStart = daysAgo(60);

    const allData = await Promise.all([
      // Total registered users
      context.db.$count(UserTable),

      // Total users 30 days ago (to compute growth)
      context.db.$count(UserTable, lte(UserTable.createdAt, thisMonthStart)),

      // Active now
      context.db
        .select({ count: countDistinct(UserActivityTable.userId) })
        .from(UserActivityTable)
        .where(gte(UserActivityTable.lastSeenAt, fiveMinutesAgo)),

      // WAU: unique logins in last 7 days
      context.db
        .select({ count: countDistinct(UserActivityTable.userId) })
        .from(UserActivityTable)
        .where(gte(UserActivityTable.loginAt, thisWeekStart)),

      // Last WAU: unique logins in the 7 days before that
      context.db
        .select({ count: countDistinct(UserActivityTable.userId) })
        .from(UserActivityTable)
        .where(
          and(
            gte(UserActivityTable.loginAt, lastWeekStart),
            lte(UserActivityTable.loginAt, thisWeekStart)
          )
        ),

      // MAU: unique logins in last 30 days
      context.db
        .select({ count: countDistinct(UserActivityTable.userId) })
        .from(UserActivityTable)
        .where(gte(UserActivityTable.loginAt, thisMonthStart)),

      // Last MAU: unique logins in the 30 days before that
      context.db
        .select({ count: countDistinct(UserActivityTable.userId) })
        .from(UserActivityTable)
        .where(
          and(
            gte(UserActivityTable.loginAt, lastMonthStart),
            lte(UserActivityTable.loginAt, thisMonthStart)
          )
        ),
    ]);

    const totalUsers = allData[0];
    const lastMonthTotal = allData[1];
    const activeNow = allData[2][0]!;
    const wau = allData[3][0]!;
    const lastWau = allData[4][0]!;
    const mau = allData[5][0]!;
    const lastMau = allData[6][0]!;

    return apiResponse(API_MESSAGES.USER.GET_STATS, {
      totalUsers,
      totalUsersGrowth: calcGrowth(lastMonthTotal, totalUsers),
      activeNow: activeNow.count,
      wau: wau.count,
      wauGrowth: calcGrowth(lastWau.count, wau.count),
      mau: mau.count,
      mauGrowth: calcGrowth(lastMau.count, mau.count),
    });
  });

export const profileUpdateProcedure = userImpl.updateProfile
  .use(userPermissionMiddleware(["self.user.manage", "self.user.update"]))
  .handler(async ({ context, input }) => {
    const userData = await context.db.transaction(async (tx) => {
      let imageUrl: string | undefined = undefined;

      if (input?.imageId) {
        const [existFile] = await tx
          .select({
            key: FileTable.key,
            entityType: FileTable.entityType,
          })
          .from(FileTable)
          .where(eq(FileTable.id, input.imageId));

        if (!existFile) {
          throw new ORPCError("NOT_FOUND", {
            message: API_MESSAGES.UPLOAD.NOT_FOUND,
          });
        }

        imageUrl = await resolveFileUrl(existFile, {
          redisClient: context.redisClient,
        });

        await tx
          .update(FileTable)
          .set({
            entityId: context.user.id,
          })
          .where(eq(FileTable.id, input.imageId));
      }

      await auth.api.updateUser({
        body: {
          image: imageUrl ?? context.user.image,
          name: input.name,
        },
        headers: context.reqHeaders,
      });

      const [userData] = await tx
        .select()
        .from(UserTable)
        .where(eq(UserTable.id, context.user.id));

      if (!userData) {
        throw new ORPCError("NOT_FOUND", {
          message: API_MESSAGES.USER.NOT_FOUND,
        });
      }

      if (input?.imageId) {
        await tx
          .update(FileTable)
          .set({
            entityId: userData.id,
          })
          .where(eq(FileTable.id, input.imageId));
      }

      return userData;
    });

    return apiResponse(API_MESSAGES.USER.PROFILE_UPDATE, userData);
  });

export const updateUserRoleProcedure = userImpl.updateRole
  .use(userPermissionMiddleware(["system.user.manage", "system.user.update"]))
  .handler(async ({ input, context, errors }) => {
    const [existUser] = await context.db
      .select({
        id: UserTable.id,
      })
      .from(UserTable)
      .where(eq(UserTable.id, input.userId))
      .limit(1);

    if (!existUser) {
      throw errors.NOT_FOUND();
    }

    const roles = await context.db
      .select({ id: RoleTable.id })
      .from(RoleTable)
      .where(inArray(RoleTable.roleName, input.roleNames));

    if (roles.length === 0) {
      throw new ORPCError("NOT_FOUND", {
        message: API_MESSAGES.USER.ROLE.NOT_FOUND,
      });
    }

    await context.db
      .delete(UserRoleTable)
      .where(eq(UserRoleTable.userId, existUser.id));

    await context.db.insert(UserRoleTable).values(
      roles.map((role) => ({
        userId: existUser.id,
        roleId: role.id,
      }))
    );

    return apiResponse(API_MESSAGES.USER.UPDATE, null);
  });

export const userDetailsProcedure = userImpl.details
  .use(userPermissionMiddleware(["system.user.manage", "system.user.read"]))
  .handler(async ({ input, errors, context }) => {
    const lastLoginSq = context.db
      .select({
        userId: UserActivityTable.userId,
        lastLogin: max(UserActivityTable.loginAt).as("last_login"),
      })
      .from(UserActivityTable)
      .groupBy(UserActivityTable.userId)
      .as("last_login_sq");

    const [user] = await context.db
      .select({
        user: UserTable,
        lastLogin: lastLoginSq.lastLogin,
      })
      .from(UserTable)
      .leftJoin(lastLoginSq, eq(UserTable.id, lastLoginSq.userId))
      .where(eq(UserTable.id, input.userId))
      .limit(1);

    if (!user) {
      throw errors.NOT_FOUND();
    }

    return apiResponse(API_MESSAGES.USER.GET_DETAILS, {
      ...user.user,
      lastLogin: user.lastLogin,
    });
  });

export const listUserForSearchProcedure = userImpl.listUserForSearch
  .use(userPermissionMiddleware(["system.user.manage", "system.user.list"]))
  .handler(async ({ input, context }) => {
    const { where } = buildPaginateOptions(
      {
        name: UserTable.name,
        email: UserTable.email,
      },
      input
    );

    const members = await context.db
      .select(userProfileColumns)
      .from(UserTable)
      .innerJoin(UserRoleTable, eq(UserRoleTable.userId, UserTable.id))
      .innerJoin(RoleTable, eq(UserRoleTable.roleId, RoleTable.id))
      .where(where)
      .groupBy(UserTable.id);

    return apiResponse(API_MESSAGES.USER.GET_ALL_FOR_SEARCH, members);
  });

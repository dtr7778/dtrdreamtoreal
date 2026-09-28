import { faker } from "@faker-js/faker";
import { call } from "@orpc/server";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { zocker } from "zocker";

import {
  insertRoleSchema,
  insertUserSchema,
  RoleTable,
  selectUserSchema,
  UserDataModel,
  UserRoleTable,
  UserTable,
} from "@workspace/drizzle/schemas";

import { auth } from "@/lib/better-auth/auth";
import { db } from "@/lib/db";
import { redisClient } from "@/lib/redis-client";
import { supabaseServerClient } from "@/lib/supabase/server-client";

import { API_MESSAGES } from "@/constants/apiMessage";
import { getUserRolesAndPermission } from "@/features/auth/data/getUserPermission";
import { mockSessionWithUser } from "@/tests/__mocks__/better-auth.mock";
import { createMockHeaders } from "@/tests/__mocks__/header.mock";
import { ORPCContext } from "@/types/orpc.types";

import { userRouter } from "./user.router";

describe("User Router (Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const orpcContext: ORPCContext = Object.freeze({
    reqHeaders: createMockHeaders(),
    db,
    redisClient,
    user: null,
    session: null,
    roles: null,
    permissions: null,
    supabaseClient: supabaseServerClient,
  } satisfies ORPCContext);

  let superAdminUser: UserDataModel;
  let targetUser: UserDataModel;

  beforeAll(async () => {
    const [superAdminRole] = await db
      .insert(RoleTable)
      .values(
        zocker(insertRoleSchema.omit({ metadata: true }))
          .supply(insertRoleSchema.shape.roleName, "SUPER_ADMIN")
          .generate()
      )
      .returning({ id: RoleTable.id });

    const [user] = await db
      .insert(UserTable)
      .values(
        zocker(insertUserSchema)
          .supply(insertUserSchema.shape.name, faker.person.fullName())
          .supply(
            insertUserSchema.shape.image,
            faker.image.personPortrait({ size: 128 })
          )
          .supply(insertUserSchema.shape.banned, false)
          .supply(insertUserSchema.shape.banExpires, null)
          .supply(insertUserSchema.shape.banReason, null)
          .supply(insertUserSchema.shape.timezone, faker.location.timeZone())
          .supply(
            insertUserSchema.shape.locale,
            faker.location.countryCode("alpha-2")
          )
          .supply(
            insertUserSchema.shape.currency,
            faker.finance.currency().code
          )
          .generate()
      )
      .returning();

    await db.insert(UserRoleTable).values({
      userId: user!.id,
      roleId: superAdminRole!.id,
    });

    superAdminUser = user!;

    const [target] = await db
      .insert(UserTable)
      .values(
        zocker(insertUserSchema)
          .supply(insertUserSchema.shape.name, faker.person.fullName())
          .supply(
            insertUserSchema.shape.image,
            faker.image.personPortrait({ size: 128 })
          )
          .supply(insertUserSchema.shape.banned, false)
          .supply(insertUserSchema.shape.banExpires, null)
          .supply(insertUserSchema.shape.banReason, null)
          .supply(insertUserSchema.shape.timezone, faker.location.timeZone())
          .supply(
            insertUserSchema.shape.locale,
            faker.location.countryCode("alpha-2")
          )
          .supply(
            insertUserSchema.shape.currency,
            faker.finance.currency().code
          )
          .generate()
      )
      .returning();

    targetUser = target!;

    await db.insert(UserRoleTable).values({
      userId: targetUser.id,
      roleId: superAdminRole!.id,
    });
  });

  describe("listUserProcedure", () => {
    beforeAll(async () => {
      const [userRole] = await db
        .insert(RoleTable)
        .values(
          zocker(insertRoleSchema.omit({ metadata: true }))
            .supply(insertRoleSchema.shape.roleName, "USER")
            .generate()
        )
        .returning({ id: RoleTable.id });

      const userIds = await db
        .insert(UserTable)
        .values(
          zocker(selectUserSchema)
            .supply(selectUserSchema.shape.name, faker.person.fullName())
            .supply(
              selectUserSchema.shape.image,
              faker.image.personPortrait({ size: 128 })
            )
            .supply(selectUserSchema.shape.timezone, faker.location.timeZone())
            .supply(
              selectUserSchema.shape.locale,
              faker.location.countryCode("alpha-2")
            )
            .supply(
              selectUserSchema.shape.currency,
              faker.finance.currency().code
            )
            .generateMany(40)
            .map((user) => {
              const isBanned = faker.datatype.boolean(0.2);

              return {
                ...user,
                banned: isBanned,
                banExpires: isBanned ? faker.date.future() : null,
                banReason: isBanned ? faker.lorem.sentence() : null,
              };
            })
        )
        .returning({ id: UserTable.id });

      await db.insert(UserRoleTable).values(
        userIds.map(({ id }) => ({
          userId: id,
          roleId: userRole!.id,
        }))
      );
    });

    test("should return user list", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(
        mockSessionWithUser({
          session: { userId: superAdminUser.id },
          user: superAdminUser,
        })
      );

      vi.mocked(getUserRolesAndPermission).mockResolvedValue({
        roles: [
          {
            roleName: "SUPER_ADMIN",
          },
        ],
        permissions: [
          {
            name: "system.user.manage",
            level: "system",
            resource: "user",
            action: "manage",
          },
          {
            name: "system.user.list",
            level: "system",
            resource: "user",
            action: "list",
          },
        ],
      });

      const result = await call(
        userRouter.list,
        {
          page: 1,
          limit: 20,
        },
        {
          context: orpcContext,
        }
      );

      expect(result.message).toBe(API_MESSAGES.USER.GET_ALL);
      expect(result.success).toBe(true);
      expect(result.data.data).toHaveLength(20);
    });

    test("should thow permission error", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(
        mockSessionWithUser({
          session: { userId: superAdminUser.id },
          user: superAdminUser,
        })
      );

      vi.mocked(getUserRolesAndPermission).mockResolvedValue({
        roles: [],
        permissions: [],
      });

      await expect(
        call(
          userRouter.list,
          {
            page: 1,
            limit: 20,
          },
          {
            context: orpcContext,
          }
        )
      ).rejects.toThrow(API_MESSAGES.GENERAL.FORBIDDEN);
    });
  });

  describe("userStatsProcedure", () => {
    test("should return user statistics", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(
        mockSessionWithUser({
          session: { userId: superAdminUser.id },
          user: superAdminUser,
        })
      );

      vi.mocked(getUserRolesAndPermission).mockResolvedValue({
        roles: [
          {
            roleName: "SUPER_ADMIN",
          },
        ],
        permissions: [],
      });

      const result = await call(userRouter.stats, {}, { context: orpcContext });

      expect(result.message).toBe(API_MESSAGES.USER.GET_STATS);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("totalUsers");
      expect(result.data).toHaveProperty("activeNow");
      expect(result.data).toHaveProperty("wau");
      expect(result.data).toHaveProperty("mau");
    });

    test("should throw permission error for non-admin users", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(
        mockSessionWithUser({
          session: { userId: superAdminUser.id },
          user: superAdminUser,
        })
      );

      vi.mocked(getUserRolesAndPermission).mockResolvedValue({
        roles: [
          {
            roleName: "USER",
          },
        ],
        permissions: [],
      });

      await expect(
        call(userRouter.stats, {}, { context: orpcContext })
      ).rejects.toThrow(API_MESSAGES.GENERAL.FORBIDDEN);
    });
  });

  describe("detailsProcedure", () => {
    test("should return user details", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(
        mockSessionWithUser({
          session: { userId: superAdminUser.id },
          user: superAdminUser,
        })
      );

      vi.mocked(getUserRolesAndPermission).mockResolvedValue({
        roles: [
          {
            roleName: "SUPER_ADMIN",
          },
        ],
        permissions: [
          {
            name: "system.user.manage",
            level: "system",
            resource: "user",
            action: "manage",
          },
          {
            name: "system.user.read",
            level: "system",
            resource: "user",
            action: "read",
          },
        ],
      });

      const result = await call(
        userRouter.details,
        { userId: superAdminUser.id },
        { context: orpcContext }
      );

      expect(result.message).toBe(API_MESSAGES.USER.GET_DETAILS);
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(superAdminUser.id);
    });

    test("should throw not found error for non-existent user", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(
        mockSessionWithUser({
          session: { userId: superAdminUser.id },
          user: superAdminUser,
        })
      );

      vi.mocked(getUserRolesAndPermission).mockResolvedValue({
        roles: [
          {
            roleName: "SUPER_ADMIN",
          },
        ],
        permissions: [
          {
            name: "system.user.manage",
            level: "system",
            resource: "user",
            action: "manage",
          },
          {
            name: "system.user.read",
            level: "system",
            resource: "user",
            action: "read",
          },
        ],
      });

      const fakeUserId = crypto.randomUUID();

      await expect(
        call(
          userRouter.details,
          { userId: fakeUserId },
          { context: orpcContext }
        )
      ).rejects.toThrow(API_MESSAGES.USER.NOT_FOUND);
    });

    test("should throw permission error", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(
        mockSessionWithUser({
          session: { userId: superAdminUser.id },
          user: superAdminUser,
        })
      );

      vi.mocked(getUserRolesAndPermission).mockResolvedValue({
        roles: [],
        permissions: [],
      });

      await expect(
        call(
          userRouter.details,
          { userId: superAdminUser.id },
          { context: orpcContext }
        )
      ).rejects.toThrow(API_MESSAGES.GENERAL.FORBIDDEN);
    });
  });

  describe("updateRoleProcedure", () => {
    test("should update user role successfully", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(
        mockSessionWithUser({
          session: { userId: superAdminUser.id },
          user: superAdminUser,
        })
      );

      vi.mocked(getUserRolesAndPermission).mockResolvedValue({
        roles: [
          {
            roleName: "SUPER_ADMIN",
          },
        ],
        permissions: [
          {
            name: "system.user.manage",
            level: "system",
            resource: "user",
            action: "manage",
          },
          {
            name: "system.user.update",
            level: "system",
            resource: "user",
            action: "update",
          },
        ],
      });

      const result = await call(
        userRouter.updateRole,
        {
          userId: targetUser.id,
          roleNames: ["SUPER_ADMIN"],
        },
        { context: orpcContext }
      );

      expect(result.message).toBe(API_MESSAGES.USER.UPDATE);
      expect(result.success).toBe(true);
    });

    test("should throw not found error for non-existent user", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(
        mockSessionWithUser({
          session: { userId: superAdminUser.id },
          user: superAdminUser,
        })
      );

      vi.mocked(getUserRolesAndPermission).mockResolvedValue({
        roles: [
          {
            roleName: "SUPER_ADMIN",
          },
        ],
        permissions: [
          {
            name: "system.user.manage",
            level: "system",
            resource: "user",
            action: "manage",
          },
          {
            name: "system.user.update",
            level: "system",
            resource: "user",
            action: "update",
          },
        ],
      });

      const fakeUserId = crypto.randomUUID();

      await expect(
        call(
          userRouter.updateRole,
          {
            userId: fakeUserId,
            roleNames: ["SUPER_ADMIN"],
          },
          { context: orpcContext }
        )
      ).rejects.toThrow(API_MESSAGES.USER.NOT_FOUND);
    });

    test("should throw permission error", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(
        mockSessionWithUser({
          session: { userId: superAdminUser.id },
          user: superAdminUser,
        })
      );

      vi.mocked(getUserRolesAndPermission).mockResolvedValue({
        roles: [],
        permissions: [],
      });

      await expect(
        call(
          userRouter.updateRole,
          {
            userId: targetUser.id,
            roleNames: ["SUPER_ADMIN"],
          },
          { context: orpcContext }
        )
      ).rejects.toThrow(API_MESSAGES.GENERAL.FORBIDDEN);
    });
  });

  describe("updateProfileProcedure", () => {
    test("should update profile successfully", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(
        mockSessionWithUser({
          session: { userId: superAdminUser.id },
          user: superAdminUser,
        })
      );

      vi.mocked(getUserRolesAndPermission).mockResolvedValue({
        roles: [
          {
            roleName: "SUPER_ADMIN",
          },
        ],
        permissions: [
          {
            name: "self.user.manage",
            level: "self",
            resource: "user",
            action: "manage",
          },
          {
            name: "self.user.update",
            level: "self",
            resource: "user",
            action: "update",
          },
        ],
      });

      const newName = faker.person.fullName();

      vi.mocked(auth.api.updateUser).mockResolvedValue({
        status: true,
      });

      const result = await call(
        userRouter.updateProfile,
        {
          name: newName,
          email: superAdminUser.email,
        },
        { context: orpcContext }
      );

      expect(result.message).toBe(API_MESSAGES.USER.PROFILE_UPDATE);
      expect(result.success).toBe(true);
    });

    test("should throw permission error", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(
        mockSessionWithUser({
          session: { userId: superAdminUser.id },
          user: superAdminUser,
        })
      );

      vi.mocked(getUserRolesAndPermission).mockResolvedValue({
        roles: [],
        permissions: [],
      });

      await expect(
        call(
          userRouter.updateProfile,
          {
            name: faker.person.fullName(),
            email: superAdminUser.email,
          },
          { context: orpcContext }
        )
      ).rejects.toThrow(API_MESSAGES.GENERAL.FORBIDDEN);
    });
  });

  describe("exportProcedure", () => {
    test("should export user data successfully", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(
        mockSessionWithUser({
          session: { userId: superAdminUser.id },
          user: superAdminUser,
        })
      );

      vi.mocked(getUserRolesAndPermission).mockResolvedValue({
        roles: [
          {
            roleName: "SUPER_ADMIN",
          },
        ],
        permissions: [
          {
            name: "system.user.manage",
            level: "system",
            resource: "user",
            action: "manage",
          },
          {
            name: "system.user.list",
            level: "system",
            resource: "user",
            action: "list",
          },
        ],
      });

      const result = await call(
        userRouter.export,
        {
          format: "csv",
        },
        { context: orpcContext }
      );

      expect(result.message).toBe(API_MESSAGES.USER.EXPORT);
      expect(result.success).toBe(true);
    });

    test("should throw permission error", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(
        mockSessionWithUser({
          session: { userId: superAdminUser.id },
          user: superAdminUser,
        })
      );

      vi.mocked(getUserRolesAndPermission).mockResolvedValue({
        roles: [],
        permissions: [],
      });

      await expect(
        call(
          userRouter.export,
          {
            format: "csv",
          },
          { context: orpcContext }
        )
      ).rejects.toThrow(API_MESSAGES.GENERAL.FORBIDDEN);
    });
  });
});

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
  beforeEach(() => vi.clearAllMocks());

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

  async function setupContext() {
    const [superAdminRole] = await db
      .insert(RoleTable)
      .values(
        zocker(insertRoleSchema)
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

    return { user: user! };
  }

  describe("listUserProcedure", () => {
    let user: UserDataModel;

    beforeAll(async () => {
      const contextData = await setupContext();
      user = contextData.user;

      const [userRole] = await db
        .insert(RoleTable)
        .values(
          zocker(insertRoleSchema)
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
          session: { userId: user.id },
          user,
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
          session: { userId: user.id },
          user,
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
});

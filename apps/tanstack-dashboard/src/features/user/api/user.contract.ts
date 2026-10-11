import { API_MESSAGES } from "#/constants/apiMessage";
import { baseContract } from "#/server/orpc.contract-base";
import type { InferContractRouterType } from "#/types/orpc.types";
import z from "zod";

import { selectUserSchema } from "@workspace/drizzle/schemas";
import {
  roleSqlSchema,
  userProfileSchema,
} from "@workspace/lib/user-api-schema";
import {
  apiOutputSchema,
  exportDataInputSchema,
  exportDataOutputSchema,
  paginateInputSchema,
  paginateOutputSchema,
} from "@workspace/lib/zod-schemas";

import { profileUpdateSchema, roleUpdateSchema } from "../user.schema";

const userBaseContract = baseContract.errors({
  NOT_FOUND: {
    status: 404,
    success: false,
    message: API_MESSAGES.USER.NOT_FOUND,
  },
});

const tags = ["User"] as const;

const listUserContract = userBaseContract
  .route({
    path: "/users/list",
    description: "List of users",
    tags,
  })
  .input(
    paginateInputSchema<typeof selectUserSchema>({
      searchFields: ["name", "email"],
      orderFields: ["name", "email", "createdAt", "updatedAt"],
    })
  )
  .output(
    apiOutputSchema(
      paginateOutputSchema(
        selectUserSchema.extend({
          lastLogin: z.date().nullable(),
          roles: z.array(roleSqlSchema),
        })
      )
    )
  );
export type ListUserContractType = InferContractRouterType<
  typeof listUserContract
>;

const listUserForSearchContract = baseContract
  .route({
    path: "/orgs/users/search",
    description: "List organization users for search",
    tags,
  })
  .input(
    paginateInputSchema<typeof selectUserSchema>({
      searchFields: ["name", "email"],
      orderFields: [],
    })
  )
  .output(apiOutputSchema(z.array(userProfileSchema)));
export type ListUserForSearchContractType = InferContractRouterType<
  typeof listUserForSearchContract
>;

const userStatsContract = userBaseContract
  .route({
    method: "GET",
    path: "/users/stats",
    description: "Get stats",
    tags,
  })
  .output(
    apiOutputSchema(
      z.object({
        totalUsers: z.number(),
        totalUsersGrowth: z.number().nullable(),
        activeNow: z.number(),
        activeSessions: z.number(),
        wau: z.number(),
        wauGrowth: z.number().nullable(),
        mau: z.number(),
        mauGrowth: z.number().nullable(),
        totalDevices: z.number(),
        newDevices: z.number(),
        failedLogins: z.number(),
      })
    )
  );
export type UserStatsContractType = InferContractRouterType<
  typeof userStatsContract
>;

const profileUpdateContract = baseContract
  .route({
    path: "/auth/profile-update",
    description: "Update profile",
    tags,
  })
  .input(profileUpdateSchema.extend({ imageId: z.uuid().optional() }))
  .output(apiOutputSchema(selectUserSchema));
export type ProfileUpdateContractType = InferContractRouterType<
  typeof profileUpdateContract
>;

const userRoleUpdateContract = userBaseContract
  .route({
    path: "/users/update/role",
    description: "Update role",
    tags,
  })
  .input(roleUpdateSchema)
  .output(apiOutputSchema(z.null()));
export type UserRoleUpdateContractType = InferContractRouterType<
  typeof userRoleUpdateContract
>;

const userDataExportContract = userBaseContract
  .route({
    path: "/users/export-data",
    description: "Export user data",
    tags,
  })
  .input(
    exportDataInputSchema<typeof selectUserSchema>({
      orderFields: ["name", "email", "createdAt", "updatedAt"],
    })
  )
  .output(
    apiOutputSchema(
      exportDataOutputSchema(
        selectUserSchema.extend({
          lastLogin: z.date().nullable(),
          roles: z.array(roleSqlSchema),
        })
      )
    )
  );
export type UserDataExportContractType = InferContractRouterType<
  typeof userDataExportContract
>;

const userDetailsContract = userBaseContract
  .route({
    path: "/users/details",
    description: "Get user details",
    tags,
  })
  .input(z.object({ userId: z.uuid() }))
  .output(
    apiOutputSchema(
      selectUserSchema.extend({
        lastLogin: z.date().nullable(),
      })
    )
  );
export type UserDetailsContractType = InferContractRouterType<
  typeof userDetailsContract
>;

export const userContract = {
  list: listUserContract,
  listUserForSearch: listUserForSearchContract,
  export: userDataExportContract,
  stats: userStatsContract,
  updateRole: userRoleUpdateContract,
  updateProfile: profileUpdateContract,
  details: userDetailsContract,
};

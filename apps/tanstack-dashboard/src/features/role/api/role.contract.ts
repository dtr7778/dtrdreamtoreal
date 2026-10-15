import { baseContract } from "#/server/orpc.contract-base";
import type { InferContractRouterType } from "#/types/orpc.types";
import z from "zod";

import {
  selectPermissionSchema,
  selectRoleSchema,
} from "@workspace/drizzle/schemas";
import {
  ActionTypeEnumSchema,
  PermissionLevelEnumSchema,
  ResourceTypeEnumSchema,
} from "@workspace/drizzle/zod-db-enums";
import { apiOutputSchema } from "@workspace/lib/zod-schemas";

const tags = ["Role & Permissions"] as const;

const listRoleContract = baseContract
  .route({
    method: "GET",
    path: "/roles/list",
    description: "List of roles",
    tags,
  })
  .output(
    apiOutputSchema(
      z.array(
        selectRoleSchema
          .pick({
            id: true,
            roleName: true,
            description: true,
          })
          .extend({
            totalUsers: z.number(),
            permissions: z.array(
              selectPermissionSchema
                .pick({
                  id: true,
                  description: true,
                })
                .extend({
                  level: PermissionLevelEnumSchema,
                  action: ActionTypeEnumSchema,
                  resource: ResourceTypeEnumSchema,
                })
            ),
          })
      )
    )
  );
export type ListRoleContractType = InferContractRouterType<
  typeof listRoleContract
>;

export const roleContract = {
  listRole: listRoleContract,
};

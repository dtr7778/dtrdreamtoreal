import { selectUserSchema } from "@workspace/drizzle/schemas";
import { RoleEnumSchema } from "@workspace/drizzle/zod-db-enums";
import {
  nodeApiOutputZodSchema,
  nodePaginateInputZodSchema,
  z,
} from "@workspace/lib/node-zod";
import type { InferContractType } from "@workspace/lib/types";
import {
  paginateOutputZodSchema,
  stringBooleanSchema,
} from "@workspace/lib/zod";

import { createContract } from "../createContract";

const listUserContract = createContract({
  path: "/users",
  method: "GET",
  input: {
    query: nodePaginateInputZodSchema<typeof selectUserSchema>({
      orderFields: ["createdAt"],
      searchFields: ["name", "email"],
      filter: z.object({
        emailVerified: stringBooleanSchema.optional(),
      }),
    }),
  },
  output: nodeApiOutputZodSchema(
    paginateOutputZodSchema(
      selectUserSchema.extend({
        banExpires: z.coerce.date().nullable(),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
        lastLogin: z.coerce.date().nullable(),
        roles: z.array(
          z.object({
            id: z.uuid(),
            roleName: RoleEnumSchema,
          })
        ),
      })
    )
  ),
  meta: {
    description: "Get all users",
  },
});

export type UserContractType = {
  list: InferContractType<typeof listUserContract>;
};

export const userContract = {
  list: listUserContract,
};

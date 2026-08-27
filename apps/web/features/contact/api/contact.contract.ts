import z from "zod";

import { selectContactSubmissionSchema } from "@workspace/drizzle/schemas";
import { ContactSubmissionStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";
import {
  apiOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/utils";

import { baseContract } from "@/server/orpc.contract-base";
import { InferContractRouterType } from "@/types/orpc.types";

const tags = ["contact"] as const;

const listContactContract = baseContract
  .route({
    path: "/contact/list",
    description: "List of all contact",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectContactSubmissionSchema>({
      searchFields: ["subject"],
      orderFields: ["createdAt"],
      filter: z.object({
        status: ContactSubmissionStatusEnumSchema.optional(),
      }),
    })
  )
  .output(
    apiOutputZodSchema(
      paginateOutputZodSchema(
        selectContactSubmissionSchema.pick({
          id: true,
          name: true,
          email: true,
          subject: true,
          phone: true,
          company: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        })
      )
    )
  );
export type ListContactContractType = InferContractRouterType<
  typeof listContactContract
>;

export const contactContract = {
  list: listContactContract,
};

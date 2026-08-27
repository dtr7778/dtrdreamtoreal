import z from "zod";

import {
  selectContactSubmissionReplySchema,
  selectContactSubmissionSchema,
} from "@workspace/drizzle/schemas";
import { ContactSubmissionStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";
import {
  apiOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/utils";

import { API_MESSAGES } from "@/constants/apiMessage";
import { userProfileSchema } from "@/features/user/user.api-schema";
import { baseContract } from "@/server/orpc.contract-base";
import { InferContractRouterType } from "@/types/orpc.types";

import { createReplySchema } from "../contact.schema";

const contactBaseContract = baseContract.errors({
  NOT_FOUND: {
    status: 404,
    success: false,
    message: API_MESSAGES.CONTACT.NOT_FOUND,
  },
});

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

const contactDetailsContract = contactBaseContract
  .route({
    path: "/contact/details",
    description: "Get contact submission details",
    tags,
  })
  .input(z.object({ contactId: z.uuid() }))
  .output(
    apiOutputZodSchema(
      selectContactSubmissionSchema.extend({
        replies: z.array(
          selectContactSubmissionReplySchema
            .pick({
              id: true,
              reply: true,
              createdAt: true,
            })
            .extend({
              repliedByUser: userProfileSchema,
            })
        ),
      })
    )
  );
export type ContactDetailsContractType = InferContractRouterType<
  typeof contactDetailsContract
>;

const createReplyContactContract = contactBaseContract
  .route({
    path: "/contact/reply",
    description: "Create a reply to a contact submission",
    tags,
  })
  .input(
    createReplySchema.extend({
      contactId: z.uuid(),
    })
  )
  .output(
    apiOutputZodSchema(
      selectContactSubmissionReplySchema.pick({
        id: true,
        reply: true,
        updatedAt: true,
        createdAt: true,
      })
    )
  );
export type CreateReplyContactContractType = InferContractRouterType<
  typeof createReplyContactContract
>;

export const contactContract = {
  list: listContactContract,
  details: contactDetailsContract,
  createReply: createReplyContactContract,
};

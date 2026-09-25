import z from "zod";

import {
  selectContactSubmissionSchema,
  selectContactUserSchema,
} from "@workspace/drizzle/schemas";
import { ContactStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";
import {
  apiOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/schemas";

import { API_MESSAGES } from "@/constants/apiMessage";
import { userProfileSchema } from "@/features/user/user.api-schema";
import { baseContract } from "@/server/orpc.contract-base";
import { InferContractRouterType } from "@/types/orpc.types";

const contactBaseContract = baseContract.errors({
  NOT_FOUND: {
    status: 404,
    success: false,
    message: API_MESSAGES.CONTACT.NOT_FOUND,
  },
});

const tags = ["contact"] as const;

const listContactContract = contactBaseContract
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
        status: ContactStatusEnumSchema.optional(),
      }),
    })
  )
  .output(
    apiOutputZodSchema(
      paginateOutputZodSchema(
        selectContactSubmissionSchema
          .pick({
            id: true,
            subject: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          })
          .extend({
            contactUser: selectContactUserSchema.pick({
              name: true,
              email: true,
              phone: true,
              company: true,
            }),
          })
      )
    )
  );
export type ListContactContractType = InferContractRouterType<
  typeof listContactContract
>;

const detailsContactContract = contactBaseContract
  .route({
    method: "GET",
    path: "/contact/{contactId}",
    description: "Get contact details",
    tags,
  })
  .input(z.object({ contactId: z.string() }))
  .output(
    apiOutputZodSchema(
      selectContactSubmissionSchema
        .pick({
          id: true,
          subject: true,
          status: true,
          message: true,
          createdAt: true,
          updatedAt: true,
        })
        .extend({
          name: selectContactUserSchema.shape.name,
          email: selectContactUserSchema.shape.email,
          phone: selectContactUserSchema.shape.phone,
          company: selectContactUserSchema.shape.company,
          replies: z.array(
            z.object({
              id: z.string(),
              reply: z.string(),
              createdAt: z.date(),
              repliedByUser: userProfileSchema,
            })
          ),
        })
    )
  );
export type DetailsContactContractType = InferContractRouterType<
  typeof detailsContactContract
>;

const createReplyContactContract = contactBaseContract
  .route({
    path: "/contact/{contactId}/reply",
    description: "Create a reply to a contact",
    tags,
  })
  .input(
    z.object({
      contactId: z.string(),
      reply: z.string(),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type CreateReplyContactContractType = InferContractRouterType<
  typeof createReplyContactContract
>;

export const contactContract = {
  list: listContactContract,
  details: detailsContactContract,
  createReply: createReplyContactContract,
};

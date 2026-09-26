import { eventIterator } from "@orpc/contract";
import z from "zod";

import {
  selectAddressSchema,
  selectCompanySchema,
  selectEmailSchema,
  selectEmailThreadSchema,
  selectSocialMediaSchema,
} from "@workspace/drizzle/schemas";
import {
  apiOutputZodSchema,
  emptyStrSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/schemas";

import { userProfileSchema } from "@/features/user/user.api-schema";
import { InferContractRouterType } from "@/types/orpc.types";

import {
  companyCreateSchema,
  companyDescriptionStreamChunkSchema,
  companyGenerateDescriptionSchema,
  companyThreadCreateSchema,
  companyUpdateSchema,
} from "../company.schema";
import { companyBaseContract } from "./company.base-contract";
import { employeeContract } from "./employee.contract";

const tags = ["Company"] as const;

const listCompanyContract = companyBaseContract
  .route({
    path: "/companies/list",
    description: "List of companies",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectCompanySchema>({
      searchFields: ["name", "email"],
      orderFields: ["createdAt"],
    })
  )
  .output(
    apiOutputZodSchema(
      paginateOutputZodSchema(
        selectCompanySchema
          .pick({
            id: true,
            name: true,
            email: true,
            phone: true,
            legalName: true,
            website: true,
            industry: true,
            employSize: true,
            createdAt: true,
            updatedAt: true,
          })
          .extend({
            createdByUser: userProfileSchema,
            employeeCount: z.number(),
          })
      )
    )
  );
export type ListCompanyContractType = InferContractRouterType<
  typeof listCompanyContract
>;

const listCompanyForSearchContract = companyBaseContract
  .route({
    path: "/companies/search",
    description: "List of companies for search",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectCompanySchema>({
      searchFields: ["name", "email"],
      orderFields: ["createdAt"],
      filter: z.object({
        id: emptyStrSchema.pipe(z.uuid().optional()).optional(),
      }),
    })
  )
  .output(
    apiOutputZodSchema(
      z.array(
        selectCompanySchema.pick({
          id: true,
          name: true,
          email: true,
          phone: true,
          legalName: true,
          website: true,
          industry: true,
          employSize: true,
          createdAt: true,
          updatedAt: true,
        })
      )
    )
  );
export type ListCompanyForSearchContractType = InferContractRouterType<
  typeof listCompanyForSearchContract
>;

const companyDetailsContract = companyBaseContract
  .route({
    path: "/companies/details",
    description: "Company details",
    tags,
  })
  .input(z.object({ companyId: z.uuid() }))
  .output(
    apiOutputZodSchema(
      selectCompanySchema
        .pick({
          id: true,
          name: true,
          legalName: true,
          email: true,
          phone: true,
          website: true,
          industry: true,
          employSize: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        })
        .extend({
          createdByUser: userProfileSchema,
          addresses: z.array(
            selectAddressSchema.extend({
              isPrimary: z.boolean(),
            })
          ),
          socialMedia: z.array(selectSocialMediaSchema),
          employeeCount: z.number(),
        })
    )
  );
export type CompanyDetailsContractType = InferContractRouterType<
  typeof companyDetailsContract
>;

const companyCreateContract = companyBaseContract
  .route({
    path: "/companies/create",
    description: "Create a company",
    tags,
  })
  .input(
    companyCreateSchema.extend({
      aiUsageIds: z.array(z.uuid()).optional(),
    })
  )
  .output(apiOutputZodSchema(selectCompanySchema));
export type CompanyCreateContractType = InferContractRouterType<
  typeof companyCreateContract
>;

const companyUpdateContract = companyBaseContract
  .route({
    path: "/companies/update",
    description: "Update a company",
    tags,
  })
  .input(
    companyUpdateSchema.extend({
      companyId: z.uuid(),
    })
  )
  .output(apiOutputZodSchema(selectCompanySchema));
export type CompanyUpdateContractType = InferContractRouterType<
  typeof companyUpdateContract
>;

const companyDeleteContract = companyBaseContract
  .route({
    path: "/companies/delete",
    description: "Delete a company",
    tags,
  })
  .input(z.object({ companyIds: z.array(z.uuid()).min(1) }))
  .output(apiOutputZodSchema(z.null()));
export type CompanyDeleteContractType = InferContractRouterType<
  typeof companyDeleteContract
>;

const listCompanyEmailThreadsContract = companyBaseContract
  .route({
    path: "/companies/email/threads/list",
    description: "List email threads for a company",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectEmailThreadSchema>({
      searchFields: ["subject", "contactEmail"],
      orderFields: ["createdAt"],
    }).extend({
      companyId: z.uuid(),
    })
  )
  .output(
    apiOutputZodSchema(
      paginateOutputZodSchema(
        selectEmailThreadSchema
          .pick({
            id: true,
            subject: true,
            contactEmail: true,
            contactName: true,
            isClosed: true,
            closedAt: true,
            createdAt: true,
            updatedAt: true,
          })
          .extend({
            createdByUser: userProfileSchema.nullable(),
            totalEmail: z.number(),
          })
      )
    )
  );
export type ListCompanyEmailThreadsContractType = InferContractRouterType<
  typeof listCompanyEmailThreadsContract
>;

const companyEmailThreadCreateContract = companyBaseContract
  .route({
    path: "/companies/email/threads/create",
    description: "Create email thread for a company",
    tags,
  })
  .input(companyThreadCreateSchema)
  .output(apiOutputZodSchema(selectEmailThreadSchema));
export type CompanyEmailThreadCreateContractType = InferContractRouterType<
  typeof companyEmailThreadCreateContract
>;

const listCompanyEmailContract = companyBaseContract
  .route({
    path: "/companies/email/list",
    description: "List email for a company",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectEmailSchema>({
      searchFields: ["subject"],
      orderFields: ["createdAt"],
    }).extend({
      threadId: z.uuid().optional(),
      companyId: z.uuid(),
    })
  )
  .output(
    apiOutputZodSchema(
      paginateOutputZodSchema(
        selectEmailSchema.pick({
          id: true,
          subject: true,
          direction: true,
          status: true,
          threadId: true,
          createdAt: true,
          updatedAt: true,
        })
      )
    )
  );
export type ListCompanyEmailContractType = InferContractRouterType<
  typeof listCompanyEmailContract
>;

const generateCompanyDescriptionContract = companyBaseContract
  .route({
    path: "/companies/generate-description",
    description:
      "Generate a company description from briefing context using AI",
    tags,
  })
  .input(companyGenerateDescriptionSchema)
  .output(eventIterator(companyDescriptionStreamChunkSchema));
export type GenerateCompanyDescriptionContractType = InferContractRouterType<
  typeof generateCompanyDescriptionContract
>;

export const companyContract = {
  list: listCompanyContract,
  listForSearch: listCompanyForSearchContract,
  details: companyDetailsContract,
  create: companyCreateContract,
  update: companyUpdateContract,
  delete: companyDeleteContract,
  generateDescription: generateCompanyDescriptionContract,
  employee: employeeContract,
  emailThread: {
    list: listCompanyEmailThreadsContract,
    create: companyEmailThreadCreateContract,
    email: {
      list: listCompanyEmailContract,
    },
  },
};

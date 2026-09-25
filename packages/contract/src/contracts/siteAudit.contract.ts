import { z } from "zod";

import { userProfileSchema } from "@workspace/drizzle/helpers";
import {
  selectAuditItemSchema,
  selectCompanySchema,
  selectCwvSnapshotSchema,
  selectFileSchema,
  selectSiteAuditSchema,
} from "@workspace/drizzle/schemas";
import {
  AuditItemStatusEnumSchema,
  CwvSourceEnumSchema,
  CwvStrategyEnumSchema,
} from "@workspace/drizzle/zod-db-enums";
import {
  nodeApiOutputZodSchema,
  nodePaginateInputZodSchema,
} from "@workspace/lib/schemas/node";
import { InferContractType } from "@workspace/lib/types";
import { paginateOutputZodSchema } from "@workspace/lib/schemas";

import { createContract } from "../createContract";

const listSiteAuditContract = createContract({
  path: "/site-audits",
  method: "GET",
  input: {
    query: nodePaginateInputZodSchema<typeof selectSiteAuditSchema>({
      orderFields: ["createdAt", "startedAt", "completedAt"],
      searchFields: ["name", "url"],
      filter: z.object({
        companyId: z.uuid().optional(),
      }),
    }),
  },
  output: nodeApiOutputZodSchema(
    paginateOutputZodSchema(
      selectSiteAuditSchema
        .pick({
          id: true,
          url: true,
          name: true,
          status: true,
          totalItems: true,
          completedItems: true,
          passedItems: true,
          failedItems: true,
        })
        .extend({
          company: selectCompanySchema.pick({
            id: true,
            name: true,
          }),
          triggeredByUser: userProfileSchema.nullable(),
          startedAt: z.coerce.date().nullable(),
          completedAt: z.coerce.date().nullable(),
          createdAt: z.coerce.date(),
          updatedAt: z.coerce.date(),
        })
    )
  ),
  meta: { description: "List of site audits" },
});

const createSiteAuditContract = createContract({
  path: "/site-audits",
  method: "POST",
  input: {
    body: z.object({
      companyId: z.uuid(),
      url: z.url(),
      name: z.string().min(1).max(255),
      description: z.string().max(2000).optional(),
    }),
  },
  output: nodeApiOutputZodSchema(
    selectSiteAuditSchema.extend({
      startedAt: z.coerce.date().nullable(),
      completedAt: z.coerce.date().nullable(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
    })
  ),
  meta: { description: "Create a site audit" },
});

const getSiteAuditContract = createContract({
  path: "/site-audits/:id",
  method: "GET",
  input: {
    params: z.object({ id: z.uuid() }),
  },
  output: nodeApiOutputZodSchema(
    selectSiteAuditSchema
      .pick({
        id: true,
        url: true,
        name: true,
        description: true,
        status: true,
        totalItems: true,
        completedItems: true,
        passedItems: true,
        failedItems: true,
      })
      .extend({
        reportImage: selectFileSchema
          .pick({
            id: true,
            key: true,
            filename: true,
            originalName: true,
            url: true,
          })
          .nullable(),
        company: selectCompanySchema.pick({
          id: true,
          name: true,
        }),
        triggeredByUser: userProfileSchema.nullable(),
        startedAt: z.coerce.date().nullable(),
        completedAt: z.coerce.date().nullable(),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
      })
  ),
  meta: { description: "Get a site audit by id" },
});

const getSiteAuditResultsContract = createContract({
  path: "/site-audits/:id/results",
  method: "GET",
  input: {
    params: z.object({ id: z.uuid() }),
  },
  output: nodeApiOutputZodSchema(
    z.object({
      siteAudit: selectSiteAuditSchema,
      summary: z.object({
        total: z.number(),
        completed: z.number(),
        passed: z.number(),
        failed: z.number(),
        warning: z.number(),
        needsReview: z.number(),
        error: z.number(),
        skipped: z.number(),
        pending: z.number(),
      }),
      sections: z.array(
        z.object({
          section: z.string(),
          total: z.number(),
          passed: z.number(),
          failed: z.number(),
          items: z.array(
            selectAuditItemSchema.extend({
              evidence: z.record(z.string(), z.unknown()).nullable(),
              createdAt: z.coerce.date(),
              updatedAt: z.coerce.date(),
            })
          ),
        })
      ),
    })
  ),
  meta: { description: "Get grouped audit results with a summary" },
});

const listSiteAuditItemsContract = createContract({
  path: "/site-audits/:id/items",
  method: "GET",
  input: {
    params: z.object({ id: z.uuid() }),
    query: nodePaginateInputZodSchema<typeof selectAuditItemSchema>({
      orderFields: ["createdAt"],
      searchFields: ["title", "url", "checklistKey"],
      filter: z.object({
        section: z.string().optional(),
        status: AuditItemStatusEnumSchema.optional(),
      }),
    }),
  },
  output: nodeApiOutputZodSchema(
    paginateOutputZodSchema(selectAuditItemSchema)
  ),
  meta: { description: "List of site audit checklist items" },
});

const updateSiteAuditContract = createContract({
  path: "/site-audits/:id",
  method: "PATCH",
  input: {
    params: z.object({ id: z.uuid() }),
    body: z.object({
      name: z.string().min(1).max(255).optional(),
      description: z.string().max(2000).nullable().optional(),
    }),
  },
  output: nodeApiOutputZodSchema(
    selectSiteAuditSchema.extend({
      startedAt: z.coerce.date().nullable(),
      completedAt: z.coerce.date().nullable(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
    })
  ),
  meta: { description: "Update a site audit" },
});

const deleteSiteAuditContract = createContract({
  path: "/site-audits/:id",
  method: "DELETE",
  input: {
    params: z.object({ id: z.uuid() }),
  },
  output: nodeApiOutputZodSchema(z.null()),
  meta: { description: "Delete a site audit" },
});

const listCwvHistoryContract = createContract({
  path: "/site-audits/:id/cwv/history",
  method: "GET",
  input: {
    params: z.object({ id: z.uuid() }),
    query: nodePaginateInputZodSchema<typeof selectCwvSnapshotSchema>({
      orderFields: ["createdAt"],
      filter: z.object({
        strategy: CwvStrategyEnumSchema.optional(),
        source: CwvSourceEnumSchema.optional(),
      }),
    }),
  },
  output: nodeApiOutputZodSchema(
    paginateOutputZodSchema(selectCwvSnapshotSchema)
  ),
  meta: { description: "Get Core Web Vitals history for a site" },
});

export type SiteAuditContractType = {
  list: InferContractType<typeof listSiteAuditContract>;
  listAuditItems: InferContractType<typeof listSiteAuditItemsContract>;
  create: InferContractType<typeof createSiteAuditContract>;
  get: InferContractType<typeof getSiteAuditContract>;
  getResult: InferContractType<typeof getSiteAuditResultsContract>;
  update: InferContractType<typeof updateSiteAuditContract>;
  delete: InferContractType<typeof deleteSiteAuditContract>;
  cwv: {
    list: InferContractType<typeof listCwvHistoryContract>;
  };
};

export const siteAuditContract = {
  list: listSiteAuditContract,
  listAuditItems: listSiteAuditItemsContract,
  create: createSiteAuditContract,
  get: getSiteAuditContract,
  getResult: getSiteAuditResultsContract,
  update: updateSiteAuditContract,
  delete: deleteSiteAuditContract,
  cwv: {
    list: listCwvHistoryContract,
  },
};

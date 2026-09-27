import z from "zod";

import { AuditStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";
import { apiOutputZodSchema } from "@workspace/lib/schemas";

import { InferContractRouterType } from "@/types/orpc.types";

import { auditBaseContract } from "./audit.base-contract";

const tags = ["Audit"];

const auditDetailsContract = auditBaseContract
  .route({
    path: "/audits/public/:id",
    method: "GET",
    description: "Get a audit details for public",
    tags,
  })
  .input(z.object({ id: z.uuid() }))
  .output(
    apiOutputZodSchema(
      z.object({
        id: z.uuid(),
        name: z.string(),
        url: z.string(),
        status: AuditStatusEnumSchema,
        startedAt: z.date().nullable(),
        completedAt: z.date().nullable(),
        score: z.number(),
        summary: z.object({
          total: z.number(),
          completed: z.number(),
          passed: z.number(),
          failed: z.number(),
          warning: z.number(),
          error: z.number(),
          needsReview: z.number(),
          skipped: z.number(),
          pending: z.number(),
        }),
        sections: z.array(
          z.object({
            section: z.string(),
            total: z.number(),
            passed: z.number(),
            failed: z.number(),
          })
        ),
        topIssues: z.array(
          z.object({
            id: z.uuid(),
            title: z.string(),
            section: z.string(),
            url: z.string().nullable(),
          })
        ),
      })
    )
  );
export type AuditDetailsContractType = InferContractRouterType<
  typeof auditDetailsContract
>;

export const auditPubilcContract = {
  details: auditDetailsContract,
};

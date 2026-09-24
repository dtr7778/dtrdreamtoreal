import { nodeApiOutputZodSchema, z } from "@workspace/lib/node-zod";
import type { InferContractType } from "@workspace/lib/types";

import { createContract } from "../createContract";

const orchestrateContract = createContract({
  path: "/audit-jobs/orchestrate",
  method: "POST",
  input: {
    body: z.object({
      siteAuditId: z.uuid(),
    }),
  },
  output: nodeApiOutputZodSchema(
    z.object({ siteAuditId: z.uuid(), enqueued: z.number() })
  ),
  meta: { description: "Internal: fan out checklist jobs for an audit run" },
});

const runCheckContract = createContract({
  path: "/audit-jobs/run-check",
  method: "POST",
  input: {
    body: z.object({
      siteAuditId: z.uuid(),
      checklistKey: z.string().min(1),
      url: z.url(),
    }),
  },
  output: nodeApiOutputZodSchema(
    z.object({ checklistKey: z.string(), status: z.string() })
  ),
  meta: { description: "Internal: run a single checklist item" },
});

const failureCallbackContract = createContract({
  path: "/audit-jobs/failure",
  method: "POST",
  input: {
    body: z.object({
      status: z.number().optional(),
      messageId: z.string().optional(),
      sourceMessageId: z.string().optional(),
      dlqId: z.string().optional(),
      url: z.string().optional(),
      retried: z.number().optional(),
      maxRetries: z.number().optional(),
      error: z.string().optional(),
    }),
  },
  output: nodeApiOutputZodSchema(z.object({ logged: z.boolean() })),
  meta: { description: "Internal: QStash failure callback / DLQ handler" },
});

export type AuditContractType = {
  orchestrate: InferContractType<typeof orchestrateContract>;
  runCheck: InferContractType<typeof runCheckContract>;
  failureCallback: InferContractType<typeof failureCallbackContract>;
};

export const auditContract = {
  orchestrate: orchestrateContract,
  runCheck: runCheckContract,
  failureCallback: failureCallbackContract,
};

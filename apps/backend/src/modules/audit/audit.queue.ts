import { z } from "zod";

import {
  createQueueContract,
  type QueueJob,
  type QueueJobInput,
} from "@workspace/lib/bullmq";

import { AUDIT_DEFAULTS } from "./constants";

/**
 * Audit queue processed by the backend worker. `orchestrate` crawls a site and
 * fans out one `runCheck` job per checklist item; the worker runs each check
 * and persists the result.
 */
export const auditQueue = createQueueContract({
  name: "audit",
  jobs: {
    orchestrate: {
      name: "audit-orchestrate",
      input: z.object({
        siteAuditId: z.uuid(),
      }),
      options: {
        attempts: AUDIT_DEFAULTS.jobRetries,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      },
    },
    runCheck: {
      name: "audit-run-check",
      input: z.object({
        siteAuditId: z.uuid(),
        checklistKey: z.string().min(1),
        url: z.url(),
      }),
      options: {
        attempts: AUDIT_DEFAULTS.jobRetries,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      },
    },
  },
});

export type OrchestrateJobPayload = QueueJobInput<
  typeof auditQueue,
  "orchestrate"
>;
export type RunCheckJobPayload = QueueJobInput<typeof auditQueue, "runCheck">;

export type AuditOrchestrateJob = QueueJob<typeof auditQueue, "orchestrate">;
export type AuditRunCheckJob = QueueJob<typeof auditQueue, "runCheck">;

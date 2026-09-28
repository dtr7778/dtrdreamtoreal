import { z } from "zod";

import type { QueueJob, QueueJobInput } from "@workspace/lib/bullmq";

import { createQueueContract } from "../createQueueContract";

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
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      },
    },
    runCheckItem: {
      name: "audit-run-check-item",
      input: z.object({
        siteAuditId: z.uuid(),
        checklistKey: z.string().min(1),
        url: z.url(),
      }),
      options: {
        attempts: 3,
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
export type RunCheckItemJobPayload = QueueJobInput<
  typeof auditQueue,
  "runCheckItem"
>;

export type AuditOrchestrateJob = QueueJob<typeof auditQueue, "orchestrate">;
export type AuditRunCheckItemJob = QueueJob<typeof auditQueue, "runCheckItem">;

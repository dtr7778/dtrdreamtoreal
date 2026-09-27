import { z } from "zod";

import {
  createQueueContract,
  type QueueJob,
  type QueueJobInput,
} from "@workspace/lib/bullmq";

import { AUDIT_DEFAULTS } from "./constants";

/**
 * Dedicated queue for heavy, post-completion audit artifacts.
 *
 * Report image rendering is CPU-bound (SVG -> PNG via resvg) and must not
 * compete with the audit queue's checks, so it runs on its own worker.
 */
export const auditReportQueue = createQueueContract({
  name: "audit-report",
  jobs: {
    generateImage: {
      name: "audit-generate-report-image",
      input: z.object({
        siteAuditId: z.uuid(),
      }),
      options: {
        attempts: AUDIT_DEFAULTS.jobRetries,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      },
    },
  },
});

export type GenerateReportImageJobPayload = QueueJobInput<
  typeof auditReportQueue,
  "generateImage"
>;

export type AuditReportGenerateImageJob = QueueJob<
  typeof auditReportQueue,
  "generateImage"
>;

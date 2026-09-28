import { z } from "zod";

import { QueueJob, QueueJobInput } from "@workspace/lib/bullmq";

import { createQueueContract } from "../createQueueContract";

/**
 * Dedicated queue for heavy, post-completion audit artifacts.
 *
 * Report image rendering is CPU-bound (SVG -> PNG via resvg) and must not
 * compete with the audit queue's checks, so it runs on its own worker.
 */
export const auditReportImageQueue = createQueueContract({
  name: "audit-report",
  jobs: {
    generateImage: {
      name: "audit-generate-report-image",
      input: z.object({
        siteAuditId: z.uuid(),
      }),
      options: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      },
    },
  },
});

export type GenerateReportImageJobPayload = QueueJobInput<
  typeof auditReportImageQueue,
  "generateImage"
>;

export type AuditReportGenerateImageJob = QueueJob<
  typeof auditReportImageQueue,
  "generateImage"
>;

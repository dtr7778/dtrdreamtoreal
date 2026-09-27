import { createHash } from "node:crypto";

import type { JobsOptions, Queue } from "bullmq";
import { injectable } from "inversify";

import { type QueueJobInput } from "@workspace/lib/bullmq";
import { InjectQueue } from "@workspace/lib/server";

import {
  auditReportQueue,
  type GenerateReportImageJobPayload,
} from "./audit-report.queue";

type AuditReportQueueKey = keyof typeof auditReportQueue.jobs & string;

type EnqueueResult = { jobId: string; queue: string };

@injectable()
export class AuditReportQueueService {
  constructor(
    @InjectQueue(auditReportQueue)
    private readonly queue: Queue
  ) {}

  /** Enqueue rendering of the audit report image for a completed run. */
  public async enqueueGenerateReportImage(
    siteAuditId: string,
    deduplicationId?: string
  ): Promise<EnqueueResult> {
    return this.addJob("generateImage", { siteAuditId }, deduplicationId);
  }

  private async addJob<K extends AuditReportQueueKey>(
    key: K,
    data: QueueJobInput<typeof auditReportQueue, K>,
    deduplicationId?: string
  ): Promise<EnqueueResult> {
    const job = auditReportQueue.jobs[key];
    const parsed = job.input.parse(data) as QueueJobInput<
      typeof auditReportQueue,
      K
    >;

    const options: JobsOptions = { ...job.options };
    if (deduplicationId) {
      options.jobId = toJobId(deduplicationId);
    }

    const created = await this.queue.add(job.name, parsed, options);

    return { jobId: String(created.id), queue: auditReportQueue.name };
  }
}

/** Generates a BullMQ-safe, stable job id from a deduplication key. */
function toJobId(deduplicationId: string): string {
  return createHash("sha1").update(deduplicationId).digest("hex");
}

export type { GenerateReportImageJobPayload };

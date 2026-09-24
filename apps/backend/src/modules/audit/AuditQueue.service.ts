import { createHash } from "node:crypto";

import type { JobsOptions, Queue } from "bullmq";
import { injectable } from "inversify";

import { type QueueJobInput } from "@workspace/lib/bullmq";
import { InjectQueue } from "@workspace/lib/server";

import {
  auditQueue,
  type RunCheckJobPayload,
} from "./audit.queue";

type AuditQueueKey = keyof typeof auditQueue.jobs & string;

type EnqueueResult = { jobId: string; queue: string };

@injectable()
export class AuditQueueService {
  constructor(
    @InjectQueue(auditQueue)
    private readonly queue: Queue
  ) {}

  /** Enqueue the orchestration job that crawls a site and fans out checks. */
  public async enqueueOrchestrate(
    siteAuditId: string,
    deduplicationId?: string
  ): Promise<EnqueueResult> {
    return this.addJob("orchestrate", { siteAuditId }, deduplicationId);
  }

  /** Enqueue a single checklist item to be run by the backend worker. */
  public async enqueueRunCheck(
    payload: RunCheckJobPayload,
    deduplicationId?: string
  ): Promise<EnqueueResult> {
    return this.addJob("runCheck", payload, deduplicationId);
  }

  private async addJob<K extends AuditQueueKey>(
    key: K,
    data: QueueJobInput<typeof auditQueue, K>,
    deduplicationId?: string
  ): Promise<EnqueueResult> {
    const job = auditQueue.jobs[key];
    const parsed = job.input.parse(data) as QueueJobInput<typeof auditQueue, K>;

    const options: JobsOptions = { ...job.options };
    if (deduplicationId) {
      options.jobId = toJobId(deduplicationId);
    }

    const created = await this.queue.add(job.name, parsed, options);

    return { jobId: String(created.id), queue: auditQueue.name };
  }
}

/**
 * BullMQ custom job ids cannot contain `:`, and audit dedup keys embed URLs.
 * Hash them to a safe, stable id so duplicate enqueues are still dropped.
 */
function toJobId(deduplicationId: string): string {
  return createHash("sha1").update(deduplicationId).digest("hex");
}

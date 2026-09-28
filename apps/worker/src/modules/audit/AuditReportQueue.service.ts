import type { JobsOptions, Queue } from "bullmq";
import { injectable } from "inversify";

import { auditReportImageQueue } from "@workspace/contract/worker";
import { EnqueueResult, type QueueJobInput } from "@workspace/lib/bullmq";
import { InjectQueue } from "@workspace/server-core/framework";
import { BaseQueue } from "@workspace/server-core/helpers";

type AuditReportQueueKey = keyof typeof auditReportImageQueue.jobs & string;

export interface IAuditReportQueueService {
  enqueueGenerateReportImage(
    siteAuditId: string,
    deduplicationId?: string
  ): Promise<EnqueueResult>;
}

@injectable()
export class AuditReportQueueService
  extends BaseQueue
  implements IAuditReportQueueService
{
  constructor(
    @InjectQueue(auditReportImageQueue)
    private readonly queue: Queue
  ) {
    super();
  }

  /** Enqueue rendering of the audit report image for a completed run. */
  public async enqueueGenerateReportImage(
    siteAuditId: string,
    deduplicationId?: string
  ): Promise<EnqueueResult> {
    return this.addJob("generateImage", { siteAuditId }, deduplicationId);
  }

  private async addJob<K extends AuditReportQueueKey>(
    key: K,
    data: QueueJobInput<typeof auditReportImageQueue, K>,
    deduplicationId?: string
  ): Promise<EnqueueResult> {
    const job = auditReportImageQueue.jobs[key];
    const parsed = job.input.parse(data) as QueueJobInput<
      typeof auditReportImageQueue,
      K
    >;

    const options: JobsOptions = {
      ...job.options,
      jobId: this.toJobId(deduplicationId),
    };

    const created = await this.queue.add(job.name, parsed, options);

    return { jobId: String(created.id), queue: auditReportImageQueue.name };
  }
}

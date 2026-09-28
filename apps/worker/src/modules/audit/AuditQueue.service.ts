import type { JobsOptions, Queue } from "bullmq";
import { injectable } from "inversify";

import { auditQueue, RunCheckItemJobPayload } from "@workspace/contract/worker";
import type { EnqueueResult, QueueJobInput } from "@workspace/lib/bullmq";
import { InjectQueue } from "@workspace/server-core/framework";
import { BaseQueue } from "@workspace/server-core/helpers";

type AuditQueueKey = keyof typeof auditQueue.jobs & string;

export interface IAuditQueueService {
  enqueueRunCheckItem(
    payload: RunCheckItemJobPayload,
    deduplicationId?: string
  ): Promise<EnqueueResult>;
}

@injectable()
export class AuditQueueService extends BaseQueue implements IAuditQueueService {
  constructor(
    @InjectQueue(auditQueue)
    private readonly queue: Queue
  ) {
    super();
  }

  /** Enqueue a single checklist item to be run by the backend worker. */
  public async enqueueRunCheckItem(
    payload: RunCheckItemJobPayload,
    deduplicationId?: string
  ): Promise<EnqueueResult> {
    return this.addJob("runCheckItem", payload, deduplicationId);
  }

  private async addJob<K extends AuditQueueKey>(
    key: K,
    data: QueueJobInput<typeof auditQueue, K>,
    deduplicationId?: string
  ): Promise<EnqueueResult> {
    const job = auditQueue.jobs[key];
    const parsed = job.input.parse(data) as QueueJobInput<typeof auditQueue, K>;

    const options: JobsOptions = {
      ...job.options,
      jobId: this.toJobId(deduplicationId),
    };

    const created = await this.queue.add(job.name, parsed, options);

    return { jobId: String(created.id), queue: auditQueue.name };
  }
}

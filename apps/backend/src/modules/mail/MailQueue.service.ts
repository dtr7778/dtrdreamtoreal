import type { JobsOptions, Queue } from "bullmq";
import { injectable } from "inversify";

import { type QueueJobInput } from "@workspace/lib/bullmq";
import { InjectQueue } from "@workspace/lib/server";

import {
  type MailJobData,
  mailQueue,
  type MailRetryJobData,
} from "./mail.queue";

type MailQueueKey = keyof typeof mailQueue.jobs & string;

type EnqueueResult = { jobId: string; queue: string };

@injectable()
export class MailQueueService {
  constructor(
    @InjectQueue(mailQueue)
    private readonly queue: Queue
  ) {}

  /** Enqueue a persisted email for the backend worker to send. */
  public async sendMail(data: MailJobData): Promise<EnqueueResult> {
    return this.addJob("send", data, { delay: data.delayMs });
  }

  /** Enqueue a retry/scheduled re-send of a persisted email. */
  public async retryMail(data: MailRetryJobData): Promise<EnqueueResult> {
    return this.addJob("retry", data, { delay: data.delayMs });
  }

  private async addJob<K extends MailQueueKey>(
    key: K,
    data: QueueJobInput<typeof mailQueue, K>,
    options?: JobsOptions
  ): Promise<EnqueueResult> {
    const job = mailQueue.jobs[key];
    const parsed = job.input.parse(data) as QueueJobInput<typeof mailQueue, K>;

    const created = await this.queue.add(job.name, parsed, {
      ...job.options,
      ...options,
    });

    return { jobId: String(created.id), queue: mailQueue.name };
  }
}

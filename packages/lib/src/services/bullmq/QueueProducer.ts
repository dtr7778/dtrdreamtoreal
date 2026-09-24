import type { Job, JobsOptions, Queue } from "bullmq";

import type {
  IJobContract,
  IQueueContract,
  QueueJob,
  QueueJobInput,
  QueueJobKey,
} from "./queue-contract.types";

/**
 * Typed facade over a BullMQ `Queue` for a given queue contract.
 *
 * Validates the payload against the job's Zod schema before enqueueing and
 * merges the job's default options with per-call options.
 *
 * @example
 * ```ts
 * const producer = bullMq.createProducer(emailQueue);
 * await producer.enqueue("send", { to: "a@b.com", subject: "Hi" });
 * ```
 */
export class QueueProducer<C extends IQueueContract> {
  constructor(
    public readonly contract: C,
    public readonly queue: Queue
  ) {}

  /**
   * Adds a job to the queue. `jobKey` is the contract key (not the BullMQ
   * job name) and `data` is validated against the job's input schema.
   */
  public async enqueue<K extends QueueJobKey<C>>(
    jobKey: K,
    data: QueueJobInput<C, K>,
    options?: JobsOptions
  ): Promise<QueueJob<C, K>> {
    const job = this.contract.jobs[jobKey] as IJobContract;
    const parsed = job.input.parse(data) as QueueJobInput<C, K>;

    const created = await this.queue.add(job.name, parsed, {
      ...job.options,
      ...options,
    });

    return created as QueueJob<C, K>;
  }

  /** Enqueue without validating (advanced/escape hatch). */
  public async enqueueRaw<K extends QueueJobKey<C>>(
    jobKey: K,
    data: QueueJobInput<C, K>,
    options?: JobsOptions
  ): Promise<Job> {
    const job = this.contract.jobs[jobKey] as IJobContract;
    return this.queue.add(job.name, data, { ...job.options, ...options });
  }
}
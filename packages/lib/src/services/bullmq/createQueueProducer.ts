import { Queue } from "bullmq";
import type { ConnectionOptions, JobsOptions, QueueOptions } from "bullmq";

import { BULLMQ_DEFAULT_PREFIX } from "./constants";
import type { IQueueContract } from "./queue-contract.types";
import { QueueProducer } from "./QueueProducer";

export interface CreateQueueProducerOptions {
  /** BullMQ connection options (e.g. `{ url }`). */
  connection: ConnectionOptions;
  /** Global key prefix for the queue. @default "bull" */
  prefix?: string;
  /** Default job options applied to every job on this queue. */
  defaultJobOptions?: JobsOptions;
  /** Extra BullMQ queue options. */
  queueOptions?: Omit<QueueOptions, "connection" | "prefix">;
}

/**
 * Creates a typed `QueueProducer` without an InversifyJS container — handy for
 * apps that just need to enqueue jobs (e.g. Next.js server code).
 *
 * @example
 * ```ts
 * const producer = createQueueProducer(emailQueue, {
 *   connection: { url: process.env.REDIS_URL },
 * });
 * await producer.enqueue("send", { to: "a@b.com", subject: "Hi" });
 * ```
 */
export function createQueueProducer<C extends IQueueContract>(
  contract: C,
  options: CreateQueueProducerOptions
): QueueProducer<C> {
  const queue = new Queue(contract.name, {
    ...options.queueOptions,
    connection: options.connection,
    prefix: options.prefix ?? BULLMQ_DEFAULT_PREFIX,
    defaultJobOptions: options.defaultJobOptions,
  });

  return new QueueProducer(contract, queue);
}

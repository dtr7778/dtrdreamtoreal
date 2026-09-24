import type { Job, JobsOptions } from "bullmq";
import type { z, ZodType } from "zod";

/**
 * A single job within a queue contract.
 */
export interface IJobContract {
  /** Unique job name (used as BullMQ job name). */
  readonly name: string;
  /** Zod schema validating/typing the job payload. */
  readonly input: ZodType;
  /** Optional Zod schema typing the job result. */
  readonly output?: ZodType;
  /** Default BullMQ job options for this job. */
  readonly options?: JobsOptions;
}

/**
 * A queue contract: a queue name plus its typed jobs. Shared by producers
 * (`QueueProducer`) and consumers (`@Worker` / `@WorkerNode`).
 */
export interface IQueueContract {
  readonly name: string;
  readonly jobs: Record<string, IJobContract>;
}

export type QueueContract = IQueueContract;

/** Keys of the jobs declared on a contract. */
export type QueueJobKey<C extends IQueueContract> = keyof C["jobs"] & string;

/** The job contract definition for a given key. */
export type QueueJobContract<
  C extends IQueueContract,
  K extends QueueJobKey<C>,
> = C["jobs"][K];

/** The BullMQ job name for a given key. */
export type QueueJobName<
  C extends IQueueContract,
  K extends QueueJobKey<C>,
> = C["jobs"][K]["name"];

/** The inferred input (job data) type for a given key. */
export type QueueJobInput<
  C extends IQueueContract,
  K extends QueueJobKey<C>,
> = z.infer<C["jobs"][K]["input"]>;

/** The inferred result type for a given key (`void` when no output schema). */
export type QueueJobOutput<
  C extends IQueueContract,
  K extends QueueJobKey<C>,
> = C["jobs"][K] extends { output: infer TOutput extends ZodType }
  ? z.infer<TOutput>
  : void;

/** A fully typed BullMQ `Job` for a given contract + job key. */
export type QueueJob<C extends IQueueContract, K extends QueueJobKey<C>> = Job<
  QueueJobInput<C, K>,
  QueueJobOutput<C, K>,
  QueueJobName<C, K>
>;

import type {
  IJobContract,
  IQueueContract,
  QueueJobKey,
} from "./queue-contract.types";

/**
 * Defines a typed queue contract shared by producers and workers.
 *
 * The literal queue/job names are preserved so they can be fed straight into
 * decorators (`@Worker`, `@WorkerNode`, `@InjectQueue`) and inferred through
 * `QueueJobInput` / `QueueJobOutput` / `QueueJob`.
 *
 * Inspired by the HTTP contract helper in `@workspace/contract`.
 *
 * @example
 * ```ts
 * export const emailQueue = createQueueContract({
 *   name: "email",
 *   jobs: {
 *     send: {
 *       name: "send-email",
 *       input: z.object({ to: z.email(), subject: z.string() }),
 *       output: z.object({ delivered: z.boolean() }),
 *       options: { attempts: 3, backoff: { type: "exponential", delay: 1000 } },
 *     },
 *   },
 * });
 * ```
 */
export function createQueueContract<const T extends IQueueContract>(
  definition: T
): T {
  return definition;
}

export function isQueueContract(value: unknown): value is IQueueContract {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "jobs" in value &&
    typeof (value as IQueueContract).name === "string"
  );
}

export function isJobContract(value: unknown): value is IJobContract {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "input" in value
  );
}

/** Returns the job contract definition for `job` within `contract`. */
export function getJobContract<
  C extends IQueueContract,
  K extends QueueJobKey<C>,
>(contract: C, job: K): C["jobs"][K] {
  return contract.jobs[job] as C["jobs"][K];
}

/** Returns the resolved BullMQ job name for `job` within `contract`. */
export function getJobName<C extends IQueueContract, K extends QueueJobKey<C>>(
  contract: C,
  job: K
): string {
  return (contract.jobs[job] as IJobContract).name;
}

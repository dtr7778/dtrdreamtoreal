import { injectable } from "inversify";

import { REFLECT_KEYS } from "../../constant";
import type {
  IWorkerDefinition,
  IWorkerOptions,
  NameOrEntity,
} from "../../types";
import { resolveName } from "../../utils/name.utils";

/**
 * Marks a class as a BullMQ Worker for a given queue.
 *
 * Accepts either a raw queue name or a queue contract.
 *
 * Inspired by `@nestjs/bullmq`'s `@Worker`.
 *
 * @example
 * ```ts
 * @Worker(emailQueue, { workerOptions: { concurrency: 5 } })
 * export class EmailWorker {
 *   @Process(emailQueue.jobs.send)
 *   async send(job: EmailJob) {}
 * }
 * ```
 */
export function Worker(
  queue: NameOrEntity,
  options?: IWorkerOptions
): ClassDecorator {
  return function (targetClass: NewableFunction) {
    const definition: IWorkerDefinition = {
      queueName: resolveName(queue),
      scope: options?.scope,
      workerOptions: options?.workerOptions,
    };

    injectable(options?.scope)(targetClass);

    Reflect.defineMetadata(REFLECT_KEYS.BULLMQ_WORKER, definition, targetClass);
  };
}

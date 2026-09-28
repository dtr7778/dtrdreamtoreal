import { REFLECT_KEYS } from "../../constant";
import type { IWorkerNodeDefinition, NameOrEntity } from "../../types";
import { resolveName } from "../../utils/name.utils";

/**
 * Marks a method as the handler for a job.
 *
 * - `@WorkerNode("send-email")` handles jobs named `send-email`.
 * - `@WorkerNode(emailQueue.jobs.send)` derives the name from a job contract.
 * - `@WorkerNode()` handles any job that has no matching named handler.
 *
 * Inspired by `@nestjs/bullmq`'s `@WorkerNode`.
 */
export function WorkerNode(job?: NameOrEntity): MethodDecorator {
  return function (target: object, propertyKey: string | symbol) {
    const workerClass = target.constructor;

    const existingWorkerNodes: IWorkerNodeDefinition[] =
      Reflect.getOwnMetadata(REFLECT_KEYS.BULLMQ_WORKER_NODE, workerClass) ||
      [];

    Reflect.defineMetadata(
      REFLECT_KEYS.BULLMQ_WORKER_NODE,
      [
        ...existingWorkerNodes,
        {
          methodName: String(propertyKey),
          jobName: job === undefined ? undefined : resolveName(job),
        },
      ],
      workerClass
    );
  };
}

import { REFLECT_KEYS } from "../../constant";
import type { IWorkerEventDefinition, WorkerEventName } from "../../types";

/**
 * Subscribes a method to a BullMQ worker event.
 *
 * Supported events: `completed`, `failed`, `error`, `active`, `stalled`,
 * `progress`, `waiting`, `drained`, `paused`, `resumed`, `ready`,
 * `closing`, `closed`, `ioredis:*`.
 *
 * Inspired by `@nestjs/bullmq`'s `@OnWorkerEvent`.
 *
 * @example
 * ```ts
 * @OnWorkerEvent("failed")
 * onFailed(job: Job | undefined, error: Error) {}
 * ```
 */
export function OnWorkerEvent(eventName: WorkerEventName): MethodDecorator {
  return function (target: object, propertyKey: string | symbol) {
    const workerClass = target.constructor;

    const existingEvents: IWorkerEventDefinition[] =
      Reflect.getOwnMetadata(REFLECT_KEYS.BULLMQ_WORKER_EVENT, workerClass) ||
      [];

    Reflect.defineMetadata(
      REFLECT_KEYS.BULLMQ_WORKER_EVENT,
      [
        ...existingEvents,
        {
          methodName: String(propertyKey),
          eventName,
        },
      ],
      workerClass
    );
  };
}

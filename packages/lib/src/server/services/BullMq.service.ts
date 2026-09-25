import {
  type ConnectionOptions,
  type Job,
  type JobsOptions,
  Queue,
  type QueueOptions,
  Worker,
} from "bullmq";
import type { Container } from "inversify";

import { BULLMQ_DEFAULT_PREFIX } from "../../bullmq/constants";
import type { IQueueContract } from "../../bullmq/queue-contract.types";
import { QueueProducer } from "../../bullmq/QueueProducer";
import { getQueueToken } from "../constant";
import type { ClassConstructor, IWorkerMetadata } from "../types";
import { MetadataExtractorService } from "./MetadataExtractor.service";

interface IWorkerEventEmitter {
  on(event: string, listener: (...args: never[]) => void): void;
}

export type QueueConfigOptions = Omit<QueueOptions, "connection" | "prefix">;

export interface IBullMqModuleOptions {
  container: Container;
  /**
   * BullMQ connection options. Pass `{ url }` or standard ioredis options.
   */
  connection: ConnectionOptions;
  /** Global key prefix for all queues/workers. @default "bull" */
  prefix?: string;
  /** Default job options applied to every registered queue. */
  defaultJobOptions?: JobsOptions;
  /** Options applied to every registered queue. */
  queueOptions?: QueueConfigOptions;
}

/**
 * Registers BullMQ queues and spins up workers from `@Worker` classes.
 *
 * Inspired by `@nestjs/bullmq`'s `BullModule` + `BullExplorer`.
 *
 * @example
 * ```ts
 * const bullMq = new BullMqService({ container, connection: { url: env.REDIS_URL } });
 * bullMq.registerContracts([emailQueue]);
 * bullMq.createWorkers([EmailWorker]);
 * ```
 */
export class BullMqService {
  private readonly container: Container;
  private readonly connection: IBullMqModuleOptions["connection"];
  private readonly prefix: string;
  private readonly defaultJobOptions?: IBullMqModuleOptions["defaultJobOptions"];
  private readonly queueOptions?: QueueConfigOptions;

  private readonly queues = new Map<string, Queue>();
  private readonly workers: Worker[] = [];

  constructor(options: IBullMqModuleOptions) {
    this.container = options.container;
    this.connection = options.connection;
    this.prefix = options.prefix ?? BULLMQ_DEFAULT_PREFIX;
    this.defaultJobOptions = options.defaultJobOptions;
    this.queueOptions = options.queueOptions;
  }

  /**
   * Creates (once) and binds a queue to the InversifyJS container so it can be
   * injected with `@InjectQueue(name)`.
   */
  public registerQueue(name: string, options?: QueueConfigOptions): Queue {
    const existing = this.queues.get(name);
    if (existing) return existing;

    const queue = new Queue(name, {
      ...this.queueOptions,
      ...options,
      connection: this.connection,
      prefix: this.prefix,
      defaultJobOptions: {
        ...this.defaultJobOptions,
        ...options?.defaultJobOptions,
      },
    });

    this.queues.set(name, queue);

    if (!this.container.isBound(getQueueToken(name))) {
      this.container.bind(getQueueToken(name)).toConstantValue(queue);
    }

    return queue;
  }

  public registerQueues(
    names: readonly string[],
    options?: QueueConfigOptions
  ): Queue[] {
    return names.map((name) => this.registerQueue(name, options));
  }

  /** Registers the queue declared by a queue contract. */
  public registerContract(
    contract: IQueueContract,
    options?: QueueConfigOptions
  ): Queue {
    return this.registerQueue(contract.name, options);
  }

  public registerContracts(
    contracts: readonly IQueueContract[],
    options?: QueueConfigOptions
  ): Queue[] {
    return contracts.map((contract) =>
      this.registerContract(contract, options)
    );
  }

  /**
   * Builds a typed producer bound to a queue contract. Registers the queue if
   * it has not been registered yet.
   */
  public createProducer<C extends IQueueContract>(
    contract: C
  ): QueueProducer<C> {
    return new QueueProducer(contract, this.registerQueue(contract.name));
  }

  public getQueue(name: string): Queue {
    const queue = this.queues.get(name);
    if (!queue) {
      throw new Error(
        `BullMQ queue "${name}" is not registered. Call registerQueue("${name}") first.`
      );
    }
    return queue;
  }

  public hasQueue(name: string): boolean {
    return this.queues.has(name);
  }

  /**
   * Instantiates a BullMQ Worker for each worker class.
   */
  public createWorkers(workerClasses: readonly ClassConstructor[]): Worker[] {
    const created: Worker[] = [];

    for (const workerClass of workerClasses) {
      const metadata = MetadataExtractorService.extractWorkerMetadata(
        this.container,
        workerClass
      );

      if (!metadata) {
        console.warn(
          `[BullMQ] Skipping ${workerClass.name} — no @Worker() decorator found.`
        );
        continue;
      }

      created.push(this.createWorker(metadata));
    }

    return created;
  }

  private createWorker(metadata: IWorkerMetadata): Worker {
    const { definition, workerInstance, workerNodes, workerEvents } = metadata;
    const { queueName, workerOptions } = definition;

    const defaultWorkerNodes = workerNodes.find(
      (workerNode) => !workerNode.jobName
    );

    const namedWorkerNodes = new Map(
      workerNodes
        .filter((workerNode) => workerNode.jobName)
        .map((workerNode) => [workerNode.jobName!, workerNode.methodName])
    );

    if (workerNodes.length === 0) {
      console.warn(
        `[BullMQ] worker ${metadata.workerClass.name} has no @Worker() methods.`
      );
    }

    const worker = new Worker(
      queueName,
      async (job: Job, token?: string, signal?: AbortSignal) => {
        const methodName =
          namedWorkerNodes.get(job.name) ?? defaultWorkerNodes?.methodName;

        if (!methodName) {
          throw new Error(
            `[BullMQ] No @Worker() handler found for job "${job.name}" on queue "${queueName}" (worker ${metadata.workerClass.name}).`
          );
        }

        const handler = (workerInstance as Record<string, unknown>)[methodName];

        if (typeof handler !== "function") {
          throw new Error(
            `[BullMQ] Handler "${methodName}" is not a function on ${metadata.workerClass.name}.`
          );
        }

        return handler.call(workerInstance, job, token, signal);
      },
      {
        ...workerOptions,
        connection: this.connection,
        prefix: this.prefix,
      }
    );

    this.bindWorkerEvents(
      worker,
      workerInstance,
      metadata.workerClass,
      workerEvents
    );

    this.workers.push(worker);

    console.log(
      `[BullMQ] Worker started — queue: "${queueName}", worker: ${metadata.workerClass.name}, jobs: [${workerNodes
        .map((workerNode) => workerNode.jobName ?? "<default>")
        .join(", ")}]`
    );

    return worker;
  }

  private bindWorkerEvents(
    worker: Worker,
    workerInstance: unknown,
    workerClass: ClassConstructor,
    workerEvents: IWorkerMetadata["workerEvents"]
  ): void {
    const emitter = worker as unknown as IWorkerEventEmitter;

    for (const { methodName, eventName } of workerEvents) {
      const listener = (workerInstance as Record<string, unknown>)[methodName];

      if (typeof listener !== "function") {
        console.warn(
          `[BullMQ] @OnWorkerEvent("${String(eventName)}") target "${methodName}" is not a function on ${workerClass.name}.`
        );
        continue;
      }

      emitter.on(
        eventName as string,
        (listener as (...args: never[]) => void).bind(workerInstance)
      );
    }
  }

  public getWorkers(): readonly Worker[] {
    return this.workers;
  }

  /**
   * Gracefully closes every worker and queue.
   */
  public async close(): Promise<void> {
    await Promise.all(this.workers.map((worker) => worker.close()));
    await Promise.all([...this.queues.values()].map((queue) => queue.close()));

    this.workers.length = 0;
    this.queues.clear();
  }
}

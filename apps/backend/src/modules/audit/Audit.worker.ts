import type { Job } from "bullmq";
import { inject } from "inversify";

import { type LoggerType } from "@workspace/lib/logger";
import { OnWorkerEvent, Worker, WorkerNode } from "@workspace/lib/server";

import { CONTAINER_TYPES } from "@/container/container-types";

import { type IAuditService } from "./Audit.service";
import {
  type AuditOrchestrateJob,
  type AuditRunCheckJob,
  auditQueue,
} from "./audit.queue";

/**
 * Runs audit work: `orchestrate` crawls the site and fans out `runCheck` jobs,
 * each `runCheck` executes a single checklist item and persists its result.
 * Job failures are retried according to each job's backoff policy.
 */
@Worker(auditQueue, { workerOptions: { concurrency: 5 } })
export class AuditWorker {
  /** Ids of jobs currently being processed, for shutdown diagnostics. */
  private readonly inFlight = new Set<string>();

  constructor(
    @inject(CONTAINER_TYPES.AuditService)
    private readonly auditService: IAuditService,
    @inject(CONTAINER_TYPES.Logger)
    private readonly log: LoggerType
  ) {}

  @WorkerNode(auditQueue.jobs.orchestrate)
  public async orchestrate(job: AuditOrchestrateJob): Promise<void> {
    const enqueued = await this.auditService.orchestrate(job.data.siteAuditId);

    this.log.info(
      { jobId: job.id, siteAuditId: job.data.siteAuditId, enqueued },
      "audit orchestrated"
    );
  }

  @WorkerNode(auditQueue.jobs.runCheck)
  public async runCheck(job: AuditRunCheckJob): Promise<void> {
    const result = await this.auditService.runCheck(
      job.data,
      job.id ?? undefined
    );

    this.log.info(
      {
        jobId: job.id,
        siteAuditId: job.data.siteAuditId,
        checklistKey: job.data.checklistKey,
        status: result.status,
      },
      "audit check completed"
    );
  }

  @OnWorkerEvent("active")
  public onActive(job: Job): void {
    if (job.id) this.inFlight.add(job.id);

    this.log.debug({ jobId: job.id, jobName: job.name }, "audit job active");
  }

  @OnWorkerEvent("completed")
  public onCompleted(job: Job): void {
    if (job.id) this.inFlight.delete(job.id);

    this.log.info(
      { jobId: job.id, jobName: job.name },
      "audit job completed"
    );
  }

  @OnWorkerEvent("failed")
  public onFailed(job: Job | undefined, error: Error): void {
    if (job?.id) this.inFlight.delete(job.id);

    this.log.error(
      {
        jobId: job?.id,
        jobName: job?.name,
        siteAuditId: job?.data?.siteAuditId,
        attemptsMade: job?.attemptsMade,
        err: error,
      },
      "audit job failed"
    );
  }

  @OnWorkerEvent("stalled")
  public onStalled(jobId: string): void {
    this.inFlight.delete(jobId);

    this.log.warn({ jobId }, "audit job stalled");
  }

  @OnWorkerEvent("error")
  public onError(error: Error): void {
    this.log.error({ err: error }, "audit worker error");
  }

  @OnWorkerEvent("drained")
  public onDrained(): void {
    this.log.info("audit queue drained");
  }

  @OnWorkerEvent("closing")
  public onClosing(): void {
    this.log.info(
      { inFlight: this.inFlight.size },
      "audit worker closing — waiting for in-flight jobs"
    );
  }

  @OnWorkerEvent("closed")
  public onClosed(): void {
    this.inFlight.clear();

    this.log.info("audit worker closed");
  }
}

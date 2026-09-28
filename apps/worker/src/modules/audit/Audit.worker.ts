import type { Job } from "bullmq";
import { inject } from "inversify";

import {
  type AuditOrchestrateJob,
  auditQueue,
  type AuditRunCheckItemJob,
} from "@workspace/contract/worker";
import { type LoggerType } from "@workspace/lib/logger";
import {
  OnWorkerEvent,
  Worker,
  WorkerNode,
} from "@workspace/server-core/framework";
import { type IAuditLogService } from "@workspace/server-core/services";

import { CONTAINER_TYPES } from "@/container/container-types";

import { type IAUditService } from "./Audit.service";

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
    private readonly auditService: IAUditService,
    @inject(CONTAINER_TYPES.AuditLogService)
    private readonly auditLog: IAuditLogService,
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

  @WorkerNode(auditQueue.jobs.runCheckItem)
  public async runCheck(job: AuditRunCheckItemJob): Promise<void> {
    const result = await this.auditService.runCheck(job.data);

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

    this.log.info({ jobId: job.id, jobName: job.name }, "audit job completed");
  }

  @OnWorkerEvent("failed")
  public async onFailed(job: Job | undefined, error: Error): Promise<void> {
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

    const siteAuditId = job?.data?.siteAuditId as string | undefined;
    if (!siteAuditId) return;

    try {
      const isOrchestrate = job?.name === auditQueue.jobs.orchestrate.name;
      const attempts = job?.opts?.attempts ?? 1;
      const isFinalAttempt = (job?.attemptsMade ?? 0) >= attempts;
      const message = error?.message ?? "Unknown error";

      if (isOrchestrate && isFinalAttempt) {
        await this.auditService.markRunFailed(siteAuditId, message);
        return;
      }

      if (isFinalAttempt && job?.data) {
        // Persist a failed item and advance progress so the run can finalize
        // instead of hanging forever.
        await this.auditService.markCheckFailed(job.data, message);
        return;
      }

      await this.auditLog.publish(siteAuditId, {
        type: "error",
        level: "error",
        message: `Attempt ${job?.attemptsMade ?? 1}/${attempts} failed (${job?.name ?? "unknown"}): ${message}`,
        data: {
          jobId: job?.id,
          jobName: job?.name,
          checklistKey: job?.data?.checklistKey,
          url: job?.data?.url,
          attemptsMade: job?.attemptsMade,
        },
      });
    } catch (publishError) {
      this.log.error(
        { err: publishError, siteAuditId },
        "failed to record audit job failure"
      );
    }
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

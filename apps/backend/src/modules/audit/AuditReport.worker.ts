import type { Job } from "bullmq";
import { inject } from "inversify";

import { type LoggerType } from "@workspace/lib/logger";
import { OnWorkerEvent, Worker, WorkerNode } from "@workspace/lib/server";

import { CONTAINER_TYPES } from "@/container/container-types";

import { type IAuditReportImageService } from "./AuditReport.service";
import {
  auditReportQueue,
  type AuditReportGenerateImageJob,
} from "./audit-report.queue";

/**
 * Renders post-completion audit artifacts.
 *
 * Runs on a dedicated queue with a single concurrency slot so CPU-bound report
 * image rendering never competes with the audit queue's checks.
 */
@Worker(auditReportQueue, { workerOptions: { concurrency: 1 } })
export class AuditReportWorker {
  /** Ids of jobs currently being processed, for shutdown diagnostics. */
  private readonly inFlight = new Set<string>();

  constructor(
    @inject(CONTAINER_TYPES.AuditReportImageService)
    private readonly auditReportImage: IAuditReportImageService,
    @inject(CONTAINER_TYPES.Logger)
    private readonly log: LoggerType
  ) {}

  @WorkerNode(auditReportQueue.jobs.generateImage)
  public async generateImage(job: AuditReportGenerateImageJob): Promise<void> {
    const file = await this.auditReportImage.generateReportImage(
      job.data.siteAuditId
    );

    this.log.info(
      {
        jobId: job.id,
        siteAuditId: job.data.siteAuditId,
        fileId: file.id,
      },
      "audit report image generated"
    );
  }

  @OnWorkerEvent("active")
  public onActive(job: Job): void {
    if (job.id) this.inFlight.add(job.id);

    this.log.debug(
      { jobId: job.id, jobName: job.name },
      "audit report job active"
    );
  }

  @OnWorkerEvent("completed")
  public onCompleted(job: Job): void {
    if (job.id) this.inFlight.delete(job.id);

    this.log.info(
      { jobId: job.id, jobName: job.name },
      "audit report job completed"
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
      "audit report job failed"
    );
  }

  @OnWorkerEvent("stalled")
  public onStalled(jobId: string): void {
    this.inFlight.delete(jobId);

    this.log.warn({ jobId }, "audit report job stalled");
  }

  @OnWorkerEvent("error")
  public onError(error: Error): void {
    this.log.error({ err: error }, "audit report worker error");
  }

  @OnWorkerEvent("drained")
  public onDrained(): void {
    this.log.info("audit report queue drained");
  }

  @OnWorkerEvent("closing")
  public onClosing(): void {
    this.log.info(
      { inFlight: this.inFlight.size },
      "audit report worker closing — waiting for in-flight jobs"
    );
  }

  @OnWorkerEvent("closed")
  public onClosed(): void {
    this.inFlight.clear();

    this.log.info("audit report worker closed");
  }
}

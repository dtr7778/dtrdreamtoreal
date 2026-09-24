import type { Job } from "bullmq";
import { inject } from "inversify";

import { type LoggerType } from "@workspace/lib/logger";
import { OnWorkerEvent, Worker, WorkerNode } from "@workspace/lib/server";
import { type IMailProcessor } from "@workspace/mail";

import { WORKER_CONTAINER_TYPES } from "@/container/worker-container/worker-container-types";

import { type MailJob, mailQueue, type MailRetryJob } from "./mail.queue";

/**
 * Sends persisted outbound emails and applies inbound/status updates.
 *
 * Jobs only carry ids; the full message is loaded from the shared database (or
 * fetched from the transport) and processed, then the result is stored back on
 * the email record. Job failures are retried according to each job's backoff
 * policy.
 */
@Worker(mailQueue, { workerOptions: { concurrency: 5 } })
export class MailWorker {
  /** Ids of jobs currently being processed, for shutdown diagnostics. */
  private readonly inFlight = new Set<string>();

  constructor(
    @inject(WORKER_CONTAINER_TYPES.MailProcessorService)
    private readonly mailProcessor: IMailProcessor,
    @inject(WORKER_CONTAINER_TYPES.Logger)
    private readonly log: LoggerType
  ) {}

  @WorkerNode(mailQueue.jobs.send)
  public async send(job: MailJob): Promise<{ resendId: string }> {
    const { resendId } = await this.mailProcessor.sendPersistedEmail(
      job.data.emailId
    );

    this.log.info(
      { jobId: job.id, emailId: job.data.emailId, resendId },
      "mail sent"
    );

    return { resendId };
  }

  @WorkerNode(mailQueue.jobs.retry)
  public async retry(job: MailRetryJob): Promise<{ resendId: string }> {
    const { resendId } = await this.mailProcessor.sendPersistedEmail(
      job.data.emailId
    );

    this.log.warn(
      {
        jobId: job.id,
        emailId: job.data.emailId,
        resendId,
        attemptsMade: job.attemptsMade,
      },
      "mail re-sent"
    );

    return { resendId };
  }

  @OnWorkerEvent("active")
  public onActive(job: Job): void {
    if (job.id) this.inFlight.add(job.id);

    this.log.debug({ jobId: job.id, jobName: job.name }, "mail job active");
  }

  @OnWorkerEvent("completed")
  public async onCompleted(job: Job, result: unknown): Promise<void> {
    if (job.id) this.inFlight.delete(job.id);

    this.log.info(
      { jobId: job.id, jobName: job.name, result },
      "mail job completed"
    );
  }

  @OnWorkerEvent("failed")
  public async onFailed(job: Job | undefined, error: Error): Promise<void> {
    if (job?.id) this.inFlight.delete(job.id);

    if (job) {
      await this.mailProcessor.processMailFailed(job.data.emailId);
    }

    this.log.error(
      {
        jobId: job?.id,
        jobName: job?.name,
        emailId: job?.data?.emailId,
        attemptsMade: job?.attemptsMade,
        err: error,
      },
      "mail job failed"
    );
  }

  @OnWorkerEvent("stalled")
  public onStalled(jobId: string): void {
    this.inFlight.delete(jobId);

    this.log.warn({ jobId }, "mail job stalled");
  }

  @OnWorkerEvent("error")
  public onError(error: Error): void {
    this.log.error({ err: error }, "mail worker error");
  }

  @OnWorkerEvent("drained")
  public onDrained(): void {
    this.log.info("mail queue drained");
  }

  @OnWorkerEvent("closing")
  public onClosing(): void {
    this.log.info(
      { inFlight: this.inFlight.size },
      "mail worker closing — waiting for in-flight jobs"
    );
  }

  @OnWorkerEvent("closed")
  public onClosed(): void {
    this.inFlight.clear();

    this.log.info("mail worker closed");
  }
}

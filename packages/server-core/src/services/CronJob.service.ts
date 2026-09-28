import type { Container } from "inversify";
import cron, { type ScheduledTask } from "node-cron";

import { MetadataExtractorService } from "../framework/services/MetadataExtractor.service";
import type { ClassConstructor, ICronJobDefinition } from "../framework/types";

export class CronJobService {
  private scheduledJobs: Map<string, ScheduledTask> = new Map();
  private jobRegistry: Map<string, { instance: unknown; methodName: string }> =
    new Map();

  constructor(private readonly dependencyContainer: Container) {}

  /**
   * Schedule a single cron job method
   */
  private scheduleJob(
    jobInstance: unknown,
    cronJobDefinition: ICronJobDefinition
  ): void {
    const { methodName, jobName, cronExpression, runOnInit, timezone } =
      cronJobDefinition;

    // Get the method from the instance
    const method = (jobInstance as Record<string, unknown>)[methodName];

    if (typeof method !== "function") {
      throw new Error(
        `Method "${methodName}" is not a valid function in ${(jobInstance as Record<string, unknown>).constructor.name}`
      );
    }

    // Store job info for manual triggering
    this.jobRegistry.set(jobName!, { instance: jobInstance, methodName });

    // Schedule the job
    const task = cron.schedule(
      cronExpression,
      async () => {
        try {
          console.log(
            `🕐 [${new Date().toISOString()}] Running job: ${jobName}`
          );
          await method.call(jobInstance);
          console.log(
            `✅ [${new Date().toISOString()}] Completed job: ${jobName}`
          );
        } catch (error) {
          console.error(
            `❌ [${new Date().toISOString()}] Error in job ${jobName}:`,
            error
          );
        }
      },
      {
        timezone,
      }
    );

    this.scheduledJobs.set(jobName!, task);

    // Run immediately if configured
    if (runOnInit) {
      console.log(`🚀 Running job on initialization: ${jobName}`);
      Promise.resolve(method.call(jobInstance)).catch((error) => {
        console.error(`❌ Error running job ${jobName} on init:`, error);
      });
    }
  }

  /**
   * Load and schedule all cron jobs from multiple classes
   */
  public loadAllJobs(cronJobClasses: readonly ClassConstructor[]): void {
    console.log(
      "\n\x1b[36m========== Cron Job Scheduler Started ==========\x1b[0m\n"
    );

    let scheduledCount = 0;

    for (const cronJobClass of cronJobClasses) {
      const metadata = MetadataExtractorService.extractCronJobMetadata(
        this.dependencyContainer,
        cronJobClass
      );

      if (!metadata) {
        console.warn(
          `\x1b[33m[Warning]\x1b[0m Skipping ${cronJobClass.name} — No @CronJobClass decorator or cron job methods found.\n`
        );
        continue;
      }

      console.log(
        `📦 Loading cron jobs from: \x1b[35m${cronJobClass.name}\x1b[0m`
      );

      for (const cronJobDefinition of metadata.cronJobs) {
        try {
          this.scheduleJob(
            metadata.jobInstance as Record<string, unknown>,
            cronJobDefinition
          );
          scheduledCount++;

          console.log(
            `   ✅ \x1b[32m${cronJobDefinition.jobName}\x1b[0m\n` +
              `      Expression: ${cronJobDefinition.cronExpression}\n` +
              `      Method: ${cronJobDefinition.methodName}()\n` +
              `      Run on init: ${cronJobDefinition.runOnInit}\n` +
              `      Timezone: ${cronJobDefinition.timezone || "system default"}\n`
          );
        } catch (error) {
          console.error(
            `   \x1b[31m[Error]\x1b[0m Failed to schedule ${cronJobDefinition.methodName}:`,
            error
          );
        }
      }
    }

    console.log(`\nTotal jobs scheduled: \x1b[35m${scheduledCount}\x1b[0m\n`);
    console.log(
      "\x1b[36m========== Cron Job Scheduler Completed ==========\x1b[0m\n"
    );
  }

  /**
   * Stop a specific job
   */
  public stopJob(jobName: string): boolean {
    const task = this.scheduledJobs.get(jobName);
    if (task) {
      task.stop();
      console.log(`⏸️  Stopped job: ${jobName}`);
      return true;
    }
    console.warn(`⚠️  Job not found: ${jobName}`);
    return false;
  }

  /**
   * Start a specific job
   */
  public startJob(jobName: string): boolean {
    const task = this.scheduledJobs.get(jobName);
    if (task) {
      task.start();
      console.log(`▶️  Started job: ${jobName}`);
      return true;
    }
    console.warn(`⚠️  Job not found: ${jobName}`);
    return false;
  }

  /**
   * Manually trigger a job
   */
  public async triggerJob(jobName: string): Promise<void> {
    const jobInfo = this.jobRegistry.get(jobName);
    if (!jobInfo) {
      throw new Error(`Job "${jobName}" not found`);
    }

    const method = (jobInfo.instance as Record<string, unknown>)[
      jobInfo.methodName
    ];
    if (typeof method !== "function") {
      throw new Error(`Method "${jobInfo.methodName}" is not a function`);
    }

    console.log(`🎯 Manually triggering job: ${jobName}`);
    await method.call(jobInfo.instance);
    console.log(`✅ Manually triggered job completed: ${jobName}`);
  }

  /**
   * Stop all scheduled jobs
   */
  public stopAll(): void {
    console.log("\n⏸️  Stopping all cron jobs...");
    this.scheduledJobs.forEach((task, name) => {
      task.stop();
      console.log(`   ⏸️  Stopped: ${name}`);
    });
    console.log("✅ All cron jobs stopped\n");
  }

  /**
   * Get all scheduled job names
   */
  public getScheduledJobs(): string[] {
    return Array.from(this.scheduledJobs.keys());
  }

  /**
   * Check if a job is running
   */
  public isJobRunning(jobName: string): boolean {
    const task = this.scheduledJobs.get(jobName);
    return task ? task.getStatus() === "scheduled" : false;
  }

  /**
   * Get job details
   */
  public getJobDetails(
    jobName: string
  ): { isScheduled: boolean; status?: string | Promise<string> } | null {
    const task = this.scheduledJobs.get(jobName);
    if (!task) return null;

    return {
      isScheduled: true,
      status: task.getStatus(),
    };
  }
}

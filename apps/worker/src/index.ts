import "reflect-metadata";

import "source-map-support/register";

import { join } from "node:path";

import { config } from "dotenv";

import {
  auditQueue,
  auditReportImageQueue,
  mailQueue,
} from "@workspace/contract/worker";
import { loadResvg } from "@workspace/generate-image";
import { resolveRedisTls } from "@workspace/redis/client/ioRedis";
import { CronJobService } from "@workspace/server-core/corn-job";
import { BullMqService } from "@workspace/server-core/framework";

import { container } from "./container/di-container";
import { env } from "./env";
import { AuditWorker } from "./modules/audit/Audit.worker";
import { AuditCronService } from "./modules/audit/AuditCron.service";
import { AuditReportWorker } from "./modules/audit/AuditReport.worker";
import { MailWorker } from "./modules/mail/Mail.worker";

config({
  path: [join(process.cwd(), ".env")],
});

async function main() {
  console.clear();
  console.log("Worker is starting....");

  await loadResvg();

  const bullMq = new BullMqService({
    container,
    connection: {
      url: env.REDIS_URL,
      maxRetriesPerRequest: null,
      ...(resolveRedisTls(env.REDIS_URL, env.REDIS_TLS) ? { tls: {} } : {}),
    },
  });

  bullMq.registerContracts([mailQueue, auditQueue, auditReportImageQueue]);
  bullMq.createWorkers([MailWorker, AuditWorker, AuditReportWorker]);

  const cronScheduler = new CronJobService(container);

  cronScheduler.loadAllJobs([AuditCronService]);

  const shutdown = async () => {
    console.log("Worker is shutting down....");
    await bullMq.close();
    cronScheduler.stopAll();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("Worker is crashed:", err);
  process.exit(1);
});

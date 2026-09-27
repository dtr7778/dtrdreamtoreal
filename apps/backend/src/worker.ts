import "reflect-metadata";

import "source-map-support/register";

import { join } from "node:path";

import { config } from "dotenv";

import { loadResvg } from "@workspace/generate-image";
import { BullMqService } from "@workspace/lib/server";

import { container } from "./container/worker-container/worker-di-container";
import { env } from "./env";
import { auditReportQueue } from "./modules/audit/audit-report.queue";
import { AuditReportWorker } from "./modules/audit/AuditReport.worker";
import { AuditWorker } from "./modules/audit/Audit.worker";
import { auditQueue } from "./modules/audit/audit.queue";
import { mailQueue } from "./modules/mail/mail.queue";
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
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      username: env.REDIS_USERNAME,
      password: env.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
    },
  });

  bullMq.registerContracts([mailQueue, auditQueue, auditReportQueue]);
  bullMq.createWorkers([MailWorker, AuditWorker, AuditReportWorker]);

  const shutdown = async () => {
    console.log("Worker is shutting down....");
    await bullMq.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("Worker is crashed:", err);
  process.exit(1);
});

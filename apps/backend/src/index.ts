import "reflect-metadata";

import "source-map-support/register";

import { join } from "node:path";

import { config } from "dotenv";

import { BullMqService } from "@workspace/lib/server";

import { container } from "./container/di-container";
import { env } from "./env";
import { auditReportQueue } from "./modules/audit/audit-report.queue";
import { auditQueue } from "./modules/audit/audit.queue";
import { AuditCronService } from "./modules/audit/AuditCron.service";
import { SiteAuditController } from "./modules/audit/SiteAudit.controller";
import { MailController } from "./modules/mail/Mail.controller";
import { mailQueue } from "./modules/mail/mail.queue";
import { ResendMailController } from "./modules/mail/ResendMail.controller";
import { Server } from "./server";

config({
  path: [join(process.cwd(), ".env")],
});

async function main() {
  try {
    console.clear();
    console.log("Server is starting....");

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

    new Server(
      container,
      [SiteAuditController, MailController, ResendMailController],
      [AuditCronService]
    ).listen(env.BACKEND_PORT);
  } catch (err) {
    console.error("Server is crashed:", err);
  }
}

main().catch(() => {
  process.exit(1);
});

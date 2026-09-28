import "reflect-metadata";

import "source-map-support/register";

import { join } from "node:path";

import { config } from "dotenv";

import {
  auditQueue,
  auditReportImageQueue,
  mailQueue,
} from "@workspace/contract/worker";
import { BullMqService } from "@workspace/server-core/framework";

import { container } from "./container/di-container";
import { env } from "./env";
import { SiteAuditController } from "./modules/audit/SiteAudit.controller";
import { MailController } from "./modules/mail/Mail.controller";
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

    bullMq.registerContracts([mailQueue, auditQueue, auditReportImageQueue]);

    new Server(container, [
      SiteAuditController,
      MailController,
      ResendMailController,
    ]).listen(env.PORT);
  } catch (err) {
    console.error("Server is crashed:", err);
  }
}

main().catch(() => {
  process.exit(1);
});

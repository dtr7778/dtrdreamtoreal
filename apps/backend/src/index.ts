import "reflect-metadata";

import "source-map-support/register";

import { join } from "node:path";

import * as Sentry from "@sentry/node";
import { config } from "dotenv";

import {
  auditQueue,
  auditReportImageQueue,
  mailQueue,
} from "@workspace/contract/worker";
import { resolveRedisTls } from "@workspace/redis/client/ioRedis";
import {
  appTag,
  isSentryEnabled,
  resolveDataCollection,
  resolveEnvironment,
  resolveLogLevels,
  resolveRelease,
  resolveTracesSampleRate,
  scrubEvent,
} from "@workspace/sentry/config";
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

if (isSentryEnabled(env.SENTRY_DSN)) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: resolveEnvironment(),
    release: resolveRelease(),
    tracesSampleRate: resolveTracesSampleRate(),
    dataCollection: resolveDataCollection(),
    initialScope: { tags: appTag("backend") },
    beforeSend: scrubEvent,
    integrations: (integrations) => [
      ...integrations,
      Sentry.pinoIntegration({
        log: { levels: resolveLogLevels() },
        error: { levels: [] },
      }),
    ],
  });
}

async function main() {
  try {
    console.clear();
    console.log("Server is starting....");

    const bullMq = new BullMqService({
      container,
      connection: {
        url: env.REDIS_URL,
        maxRetriesPerRequest: null,
        ...(resolveRedisTls(env.REDIS_URL, env.REDIS_TLS) ? { tls: {} } : {}),
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
    Sentry.captureException(err);
    await Sentry.flush(2000);
  }
}

main().catch(async (err) => {
  Sentry.captureException(err);
  await Sentry.flush(2000);
  process.exit(1);
});

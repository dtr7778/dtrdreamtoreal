import { env as workerEnv } from "cloudflare:workers";

import type { DatabaseType } from "@workspace/drizzle/client";
import { createMailService } from "@workspace/mail/factory";

import { getDB } from "./db";
import { env } from "./env";

export function getMailService(db?: DatabaseType) {
  return createMailService({
    database: db ?? getDB(),
    queue: workerEnv.MAIL_QUEUE,
    mailConfig: {
      appName: env.VITE_APP_NAME,
      systemMail: env.VITE_SYSTEM_MAIL,
      supportMail: env.VITE_SUPPORT_MAIL,
    },
  });
}

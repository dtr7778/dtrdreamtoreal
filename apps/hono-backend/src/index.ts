import { WorkerEntrypoint } from "cloudflare:workers";

import { createDrizzleClient } from "@workspace/drizzle/client";
import { logger } from "@workspace/lib/logger";
import { MailQueueProcessor } from "@workspace/mail/consumer";
import { ResendMailTransport } from "@workspace/mail/transports";

import app from "./app";
import { getAuth } from "./lib/auth";
import { validateEnv } from "./lib/env";
import type { AppEnv } from "./types";

export { ChatHubDurableObject } from "./modules/chat/chat-hub.do";

/**
 * RPC entrypoint
 */
export class AuthEntrypoint extends WorkerEntrypoint<AppEnv> {
  async getSession(headers: Headers) {
    return getAuth(this.env).api.getSession({ headers });
  }
  async updateUser(
    data: {
      name?: string | undefined;
      currency?: string | null | undefined;
      image?: string | null | undefined;
      local?: string | null | undefined;
      timezone?: string | null | undefined;
    },
    headers: Headers
  ) {
    return getAuth(this.env).api.updateUser({ body: data, headers });
  }
  async listSessions(headers: Headers) {
    return getAuth(this.env).api.listSessions({
      headers,
    });
  }
  async listUserAccounts(headers: Headers) {
    return getAuth(this.env).api.listUserAccounts({
      headers,
    });
  }
}

export default {
  fetch: app.fetch,
  async queue(batch, env): Promise<void> {
    const config = validateEnv(env);

    const transport = new ResendMailTransport(config.RESEND_API_KEY);

    const database = createDrizzleClient(env.DB);

    const mailQueueProcessor = new MailQueueProcessor(
      database,
      transport,
      logger({
        serviceName: "dtrdreamtoreal-mail-worker",
        logLevel: config.LOG_LEVEL,
      })
    );

    await mailQueueProcessor.handleBatch(batch);
  },
} satisfies ExportedHandler<AppEnv>;

import { WorkerEntrypoint } from "cloudflare:workers";
import { createDrizzleClient } from "@workspace/drizzle/client";
import { logger } from "@workspace/lib/logger";
import { MailQueueProcessor } from "@workspace/mail/consumer";
import { ResendMailTransport } from "@workspace/mail/transports";
import app from "./app";
import { getAuth } from "./lib/auth";
import { validateEnv } from "./lib/env";
/**
 * RPC entrypoint
 */
export class AuthEntrypoint extends WorkerEntrypoint {
    async getSession(headers) {
        return getAuth(this.env).api.getSession({ headers });
    }
    async updateUser(data, headers) {
        return getAuth(this.env).api.updateUser({ body: data, headers });
    }
    async listSessions(headers) {
        return getAuth(this.env).api.listSessions({
            headers,
        });
    }
    async listUserAccounts(headers) {
        return getAuth(this.env).api.listUserAccounts({
            headers,
        });
    }
}
export default {
    fetch: app.fetch,
    async queue(batch, env) {
        const config = validateEnv(env);
        const transport = new ResendMailTransport(config.RESEND_API_KEY);
        const database = createDrizzleClient(env.DB);
        const mailQueueProcessor = new MailQueueProcessor(database, transport, logger({
            serviceName: "dtrdreamtoreal-mail-worker",
            logLevel: config.LOG_LEVEL,
        }));
        await mailQueueProcessor.handleBatch(batch);
    },
};

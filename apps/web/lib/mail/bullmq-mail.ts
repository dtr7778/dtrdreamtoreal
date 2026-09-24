import {
  BULLMQ_TRANSPORT_HEADERS,
  type BullmqEnqueueResult,
  type IBullmqPublisher,
} from "@workspace/lib/bullmq";
import { createBullmqMailer, type IBullmqMailerService } from "@workspace/mail";

import { apiClient } from "../api";
import { db } from "../db";
import { env } from "../env";
import { redisClient } from "../redis-client";

/** Payload carried by the `mail/send` job. */
interface MailJobPayload {
  emailId: string;
  threadId?: string;
}

/**
 * {@link IBullmqPublisher} for the mail queue.
 *
 * Calls the internal `apiClient.mail.send` contract with just the email id
 * (+ optional thread id) and the HMAC signature. The backend worker loads the
 * persisted email from the shared database and sends it.
 */
const mailBullmqPublisher: IBullmqPublisher = {
  async enqueue(request, signature) {
    const payload = request.payload as MailJobPayload;

    const response = await apiClient.mail.send.callApi({
      input: { body: payload },
      config: {
        headers: {
          [BULLMQ_TRANSPORT_HEADERS.signature]: signature,
        },
      },
    });

    return {
      messageId: response.data.jobId,
      queue: response.data.queue,
    } satisfies BullmqEnqueueResult;
  },
};

const globalForBullmqMail = globalThis as unknown as {
  bullmqMail?: IBullmqMailerService;
};

/**
 * BullMQ-backed mail service. It renders and persists the email, then enqueues
 * it on the backend `mail` queue; the backend worker performs the send and
 * updates the shared email record.
 */
export const bullmqMail =
  globalForBullmqMail.bullmqMail ??
  createBullmqMailer({
    appName: env.NEXT_PUBLIC_SITE_NAME,
    database: db,
    redisClient,
    supportMail: env.SUPPORT_MAIL,
    systemMail: env.SYSTEM_MAIL,
    signingSecret: env.BULLMQ_SIGNING_SECRET,
    publisher: mailBullmqPublisher,
    defaultRetries: 3,
    dedupWindowSeconds: 300,
  });

if (env.NODE_ENV !== "production") {
  globalForBullmqMail.bullmqMail = bullmqMail;
}

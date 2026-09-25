import {
  BULLMQ_TRANSPORT_HEADERS,
  type BullmqEnqueueResult,
} from "@workspace/lib/bullmq";
import {
  createBullmqMail,
  type IBullmqMailService,
  type RawMailPayload,
  type TemplateMailPayload,
} from "@workspace/mail";

import { apiClient } from "../api";
import { env } from "../env";

const globalForBullmqMail = globalThis as unknown as {
  bullmqMail?: IBullmqMailService;
};

/**
 * BullMQ mail publisher used by the web app. It signs the template/raw payload
 * and ships it to the backend `POST /mails` / `POST /mails/raw` endpoints; the
 * backend renders, dedupes, persists and enqueues.
 */
export const bullmqMail =
  globalForBullmqMail.bullmqMail ??
  createBullmqMail({
    signingSecret: env.BULLMQ_SIGNING_SECRET,
    publisher: {
      async enqueue(request, signature) {
        const config = {
          headers: {
            [BULLMQ_TRANSPORT_HEADERS.signature]: signature,
          },
        };

        if (request.job === "sendRaw") {
          const response = await apiClient.mail.raw.callApi({
            input: { body: request.payload as RawMailPayload },
            config,
          });

          return {
            messageId: response.data.jobId,
            queue: response.data.queue,
          } satisfies BullmqEnqueueResult;
        }

        const response = await apiClient.mail.send.callApi({
          input: { body: request.payload as TemplateMailPayload },
          config,
        });

        return {
          messageId: response.data.jobId,
          queue: response.data.queue,
        } satisfies BullmqEnqueueResult;
      },
      async enqueueBatch(request, signature) {
        const config = {
          headers: {
            [BULLMQ_TRANSPORT_HEADERS.signature]: signature,
          },
        };

        if (request.job === "sendRawBatch") {
          const response = await apiClient.mail.rawBatch.callApi({
            input: { body: { items: request.payloads as RawMailPayload[] } },
            config,
          });

          return response.data.results.map((result) => ({
            success: result.success,
            messageId: result.jobId,
            queue: result.queue,
            error: result.error,
          }));
        }

        const response = await apiClient.mail.sendBatch.callApi({
          input: {
            body: { items: request.payloads as TemplateMailPayload[] },
          },
          config,
        });

        return response.data.results.map((result) => ({
          success: result.success,
          messageId: result.jobId,
          queue: result.queue,
          error: result.error,
        }));
      },
    },
    defaultRetries: 3,
  });

if (env.NODE_ENV !== "production") {
  globalForBullmqMail.bullmqMail = bullmqMail;
}

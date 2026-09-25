import { z } from "zod";

import {
  createQueueContract,
  type QueueJob,
  type QueueJobInput,
} from "@workspace/lib/bullmq";

/**
 * Mail queue processed by the backend. Jobs carry only ids: the worker loads
 * the persisted email (or fetches it from the transport) and does the work.
 */
export const mailQueue = createQueueContract({
  name: "mail",
  jobs: {
    send: {
      name: "send-mail",
      input: z.object({
        emailId: z.uuid().min(1),
        threadId: z.uuid().optional(),
        /** Optional delay (ms) before the send is attempted. */
        delayMs: z.number().int().nonnegative().optional(),
      }),
      output: z.object({ resendId: z.string() }),
      options: {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      },
    },
  },
});

export type MailJobData = QueueJobInput<typeof mailQueue, "send">;
export type MailJob = QueueJob<typeof mailQueue, "send">;

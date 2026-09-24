import z from "zod";

import { nodeApiOutputZodSchema } from "@workspace/lib/node-zod";
import { InferContractType } from "@workspace/lib/types";

import { createContract } from "../createContract";

const sendMailContract = createContract({
  path: "/mails",
  method: "POST",
  input: {
    body: z.object({
      emailId: z.uuid().min(1, "Email Id is required"),
      threadId: z.uuid().optional(),
    }),
  },
  output: nodeApiOutputZodSchema(
    z.object({ jobId: z.string(), queue: z.string() })
  ),
  meta: {
    description: "Email sending api",
  },
});

export type MailContractType = {
  send: InferContractType<typeof sendMailContract>;
};

export const mailContract = {
  send: sendMailContract,
};

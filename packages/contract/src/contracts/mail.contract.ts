import z from "zod";

import { nodeApiOutputZodSchema } from "@workspace/lib/node-zod";
import { InferContractType } from "@workspace/lib/types";
import {
  mailBatchItemResultSchema,
  mailTemplatePayloadSchema,
  rawMailBatchPayloadSchema,
  rawMailPayloadSchema,
  templateMailBatchPayloadSchema,
} from "@workspace/mail/definitions";

import { createContract } from "../createContract";

const batchOutput = nodeApiOutputZodSchema(
  z.object({ results: z.array(mailBatchItemResultSchema) })
);

const sendMailContract = createContract({
  path: "/mails",
  method: "POST",
  input: {
    body: mailTemplatePayloadSchema,
  },
  output: nodeApiOutputZodSchema(
    z.object({ jobId: z.string(), queue: z.string() })
  ),
  meta: {
    description: "Template email sending api",
  },
});

const sendRawMailContract = createContract({
  path: "/mails/raw",
  method: "POST",
  input: {
    body: rawMailPayloadSchema,
  },
  output: nodeApiOutputZodSchema(
    z.object({ jobId: z.string(), queue: z.string() })
  ),
  meta: {
    description: "Raw email sending api",
  },
});

const sendMailBatchContract = createContract({
  path: "/mails/batch",
  method: "POST",
  input: {
    body: templateMailBatchPayloadSchema,
  },
  output: batchOutput,
  meta: {
    description: "Batch template email sending api",
  },
});

const sendRawMailBatchContract = createContract({
  path: "/mails/raw/batch",
  method: "POST",
  input: {
    body: rawMailBatchPayloadSchema,
  },
  output: batchOutput,
  meta: {
    description: "Batch raw email sending api",
  },
});

export type MailContractType = {
  send: InferContractType<typeof sendMailContract>;
  raw: InferContractType<typeof sendRawMailContract>;
  sendBatch: InferContractType<typeof sendMailBatchContract>;
  rawBatch: InferContractType<typeof sendRawMailBatchContract>;
};

export const mailContract = {
  send: sendMailContract,
  raw: sendRawMailContract,
  sendBatch: sendMailBatchContract,
  rawBatch: sendRawMailBatchContract,
};

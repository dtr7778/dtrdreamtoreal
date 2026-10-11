import z from "zod";

export const mailQueueEnvelopeSchema = z.object({
  version: z.literal(1).default(1),
  emailId: z.uuid(),
  threadId: z.string().min(1).optional(),
  isSystemMail: z.boolean().default(true),
  queuedAt: z.number().int().nonnegative(),
});

export type MailQueueEnvelope = z.infer<typeof mailQueueEnvelopeSchema>;
export type MailQueueEnvelopeInput = z.input<typeof mailQueueEnvelopeSchema>;

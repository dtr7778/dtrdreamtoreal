import z from "zod";

export const createReplySchema = z.object({
  reply: z.string().min(1, "Reply is required"),
});
export type CreateReplyType = z.infer<typeof createReplySchema>;

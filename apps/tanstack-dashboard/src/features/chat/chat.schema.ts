import z from "zod";

export const createGroupSchema = z.object({
  name: z.string().trim().min(1).max(80),
  memberIds: z
    .array(z.uuid())
    .min(1, "At least one member is required")
    .max(20),
});
export type CreateGroupType = z.infer<typeof createGroupSchema>;

export const updateGroupSchema = z.object({
  roomId: z.uuid(),
  name: z.string().trim().optional(),
  memberIds: z
    .array(z.uuid())
    .min(1, "At least one member is required")
    .max(20),
});
export type UpdateGroupType = z.infer<typeof updateGroupSchema>;

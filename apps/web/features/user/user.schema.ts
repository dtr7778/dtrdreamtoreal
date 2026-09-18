import z from "zod";

import { RoleEnumSchema } from "@workspace/drizzle/zod-db-enums";
import { emailField } from "@workspace/lib/zod";

export const userUpdateSchema = z.object({
  displayRole: z.string().nullable(),
  role: RoleEnumSchema,
});
export type UserUpdateType = z.infer<typeof userUpdateSchema>;

export const roleUpdateSchema = z.object({
  userId: z.uuid(),
  roleNames: z.array(RoleEnumSchema).min(1, "At least one role is required"),
});
export type RoleUpdateType = z.infer<typeof roleUpdateSchema>;

export const profileUpdateSchema = z.object({
  name: z.string(),
  email: emailField({ fieldName: "email" }),
});
export type ProfileUpdateType = z.infer<typeof profileUpdateSchema>;

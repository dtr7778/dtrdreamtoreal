import z from "zod";

export const auditCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(255, "Name is too long"),
  url: z.url("Enter a valid URL, e.g. https://example.com"),
  description: z
    .string()
    .trim()
    .max(2000, "Description is too long")
    .optional(),
});
export type AuditCreateType = z.infer<typeof auditCreateSchema>;

export const auditUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(255, "Name is too long"),
  description: z
    .string()
    .trim()
    .max(2000, "Description is too long")
    .optional(),
});
export type AuditUpdateType = z.infer<typeof auditUpdateSchema>;

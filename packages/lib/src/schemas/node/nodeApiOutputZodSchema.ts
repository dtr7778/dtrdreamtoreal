import z from "zod";

export function nodeApiOutputZodSchema<
  T extends z.ZodObject<z.ZodRawShape> | z.ZodNull | z.ZodArray | z.ZodRecord,
>(
  schema: T
): z.ZodObject<{
  message: z.ZodString;
  statusCode: z.ZodNumber;
  success: z.ZodBoolean;
  data: T;
}> {
  return z.object({
    message: z.string(),
    statusCode: z.number(),
    success: z.boolean(),
    data: schema,
  });
}

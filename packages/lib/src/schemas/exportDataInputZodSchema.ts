import z from "zod";

import { ExtractObjectKeys } from "./paginateInputZodSchema";

export function exportDataInputZodSchema<
  TModel extends z.ZodObject<z.ZodRawShape>,
>({
  orderFields,
  filter,
}: {
  filter?: z.ZodObject<z.ZodRawShape>;
  orderFields?: ReadonlyArray<ExtractObjectKeys<TModel>>;
}): z.ZodObject<{
  format: z.ZodEnum<{ csv: "csv"; json: "json" }>;
  order: z.ZodOptional<z.ZodNullable<z.ZodEnum<{ asc: "asc"; desc: "desc" }>>>;
  orderField: z.ZodOptional<
    z.ZodNullable<
      z.ZodEnum<{
        [K in string]: string;
      }>
    >
  >;
  filter:
    | z.ZodOptional<z.ZodObject<z.ZodRawShape>>
    | z.ZodOptional<z.ZodNullable<z.ZodObject<z.ZodRawShape>>>;
}> {
  return z.object({
    format: z.enum(["csv", "json"]),
    order: z
      .enum(["asc", "desc"] as const)
      .nullable()
      .optional(),
    orderField: z
      .enum(orderFields as unknown as [string, ...string[]])
      .nullable()
      .optional(),
    filter: filter ? filter.optional() : z.object({}).nullable().optional(),
  });
}

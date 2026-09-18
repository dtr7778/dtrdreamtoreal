import { ExtractObjectKeys } from "../zod/paginateInputZodSchema";
import { nodeFieldValidatorZodSchema } from "./nodeFieldValidatorZodSchema";
import { searchFilterZodSchema } from "./searchFilterZodSchema";
import { z } from "./zod";

export function nodePaginateInputZodSchema<
  TModel extends z.ZodObject<z.ZodRawShape>,
  TFilter extends z.ZodObject<z.ZodRawShape> = z.ZodObject<z.ZodRawShape>,
>({
  orderFields,
  filter,
  searchFields,
}: {
  filter?: TFilter;
  orderFields?: ReadonlyArray<ExtractObjectKeys<TModel>>;
  searchFields?: ReadonlyArray<ExtractObjectKeys<TModel>>;
}): z.ZodObject<{
  page: z.ZodOptional<z.ZodNullable<z.ZodDefault<z.ZodNumber>>>;
  limit: z.ZodOptional<z.ZodNullable<z.ZodDefault<z.ZodNumber>>>;
  order: z.ZodOptional<z.ZodNullable<z.ZodEnum<{ asc: "asc"; desc: "desc" }>>>;
  orderField: z.ZodOptional<
    z.ZodNullable<
      z.ZodEnum<{
        [K in string]: string;
      }>
    >
  >;
  search: z.ZodOptional<z.ZodNullable<z.ZodString>>;
  searchFields: ReturnType<typeof nodeFieldValidatorZodSchema>;
  filter: ReturnType<typeof searchFilterZodSchema<TFilter>>;
}> {
  const base = z.object({
    page: z
      .number()
      .int()
      .min(1)
      .default(1)
      .nullish()
      .openapi({
        param: {
          name: "page",
          in: "query",
          required: false,
          description: "Page number for pagination",
        },
      }),
    limit: z
      .number()
      .int()
      .min(1)
      .default(20)
      .nullish()
      .openapi({
        param: {
          name: "limit",
          in: "query",
          required: false,
          description: "Page size for pagination",
        },
      }),
    order: z
      .enum(["asc", "desc"] as const)
      .nullish()
      .openapi({
        param: {
          name: "order",
          in: "query",
          required: false,
          description: "Order direction",
        },
        examples: ["asc", "desc"],
      }),
    orderField: z
      .enum(orderFields as unknown as [string, ...string[]])
      .nullish()
      .openapi({
        param: {
          name: "orderField",
          in: "query",
          required: false,
          description: "Field to order by",
        },
      }),
    search: z
      .string()
      .trim()
      .toLowerCase()
      .nullish()
      .openapi({
        param: {
          name: "search",
          in: "query",
          required: false,
          description: "Search value",
        },
      }),
    searchFields: nodeFieldValidatorZodSchema("searchFields", searchFields),
    filter: searchFilterZodSchema(filter),
  });

  return base;
}

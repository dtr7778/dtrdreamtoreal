import z from "zod";

import { stringToArray } from "..";

export function searchFilterZodSchema<T extends z.ZodObject<z.ZodRawShape>>(
  zodSchema?: T
) {
  return z
    .string()
    .nullish()
    .transform((value): Record<string, string> => {
      if (!value) return {};
      const entries = stringToArray(value, ",").map((pairs) => {
        const pair = stringToArray(pairs, ":");
        return pair.length === 2 ? pair : [];
      });
      return Object.fromEntries(entries);
    })
    .pipe(
      zodSchema as unknown as z.ZodType<z.output<T>, Record<string, string>>
    )
    .nullish()
    .openapi({
      param: {
        name: "filter",
        in: "query",
        required: false,
        description: "Filter fields, e.g. first:value,second:value",
      },
    });
}

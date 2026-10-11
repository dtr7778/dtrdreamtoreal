import type { ZodSchema } from "../../types";
import { jsonContent } from "./jsonContent";

export const jsonContentRequired = <T extends ZodSchema>(
  schema: T,
  description: string
) => {
  return {
    ...jsonContent(schema, description),
    required: true,
  };
};

import type { ZodType } from "zod";

import { ParameterType } from "../constant";
import { createParameterDecorator } from "./Parameter.decorators";

export function RequestValidator(requestSchema: ZodType): ParameterDecorator {
  return createParameterDecorator(
    ParameterType.REQUEST_VALIDATOR,
    undefined,
    undefined,
    requestSchema
  );
}

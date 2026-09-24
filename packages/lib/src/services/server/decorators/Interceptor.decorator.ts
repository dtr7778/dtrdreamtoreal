import { REFLECT_KEYS } from "../constant";
import type { ClassConstructor, IInterceptor } from "../types";
import { createMetadataDecorator } from "./createMetadataDecorator";

export const UseInterceptors = createMetadataDecorator<
  ClassConstructor<IInterceptor>
>(REFLECT_KEYS.INTERCEPTOR);
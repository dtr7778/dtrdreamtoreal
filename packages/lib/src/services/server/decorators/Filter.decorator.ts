import { REFLECT_KEYS } from "../constant";
import type { ClassConstructor, IExceptionFilter } from "../types";
import { createMetadataDecorator } from "./createMetadataDecorator";

export const UseFilters = createMetadataDecorator<
  ClassConstructor<IExceptionFilter> | IExceptionFilter
>(REFLECT_KEYS.FILTER);
import { REFLECT_KEYS } from "../constant";
import type { ClassConstructor, IGuard } from "../types";
import { createMetadataDecorator } from "./createMetadataDecorator";

export const UseGuards = createMetadataDecorator<ClassConstructor<IGuard>>(
  REFLECT_KEYS.GUARD
);
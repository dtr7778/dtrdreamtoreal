import { REFLECT_KEYS } from "../constant";
import type { ClassConstructor, IMiddleware } from "../types";
import { createMetadataDecorator } from "./createMetadataDecorator";

export const UseMiddlewares = createMetadataDecorator<
  ClassConstructor<IMiddleware>
>(REFLECT_KEYS.MIDDLEWARE);
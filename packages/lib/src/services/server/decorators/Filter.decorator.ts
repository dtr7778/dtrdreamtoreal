import { REFLECT_KEYS } from "../constant";
import type { ClassConstructor, IExceptionFilter } from "../types";

export function UseFilters(
  ...exceptionFilters: (ClassConstructor<IExceptionFilter> | IExceptionFilter)[]
): MethodDecorator & ClassDecorator {
  return function (
    target: object | NewableFunction,
    propertyKey?: string | symbol
  ) {
    if (propertyKey) {
      // Apply to method
      const existingFilters: (
        | ClassConstructor<IExceptionFilter>
        | IExceptionFilter
      )[] =
        Reflect.getMetadata(
          REFLECT_KEYS.FILTER,
          target.constructor,
          propertyKey
        ) || [];

      Reflect.defineMetadata(
        REFLECT_KEYS.FILTER,
        [...existingFilters, ...exceptionFilters],
        target.constructor,
        propertyKey
      );
    } else {
      // Apply to class
      const existingFilters: (
        | ClassConstructor<IExceptionFilter>
        | IExceptionFilter
      )[] = Reflect.getMetadata(REFLECT_KEYS.FILTER, target) || [];

      Reflect.defineMetadata(
        REFLECT_KEYS.FILTER,
        [...existingFilters, ...exceptionFilters],
        target
      );
    }
  };
}

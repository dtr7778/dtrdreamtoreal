import { REFLECT_KEYS } from "../constant";
import type { ClassConstructor, IMiddleware } from "../types";

export function UseMiddleware(
  ...middlewareClasses: ClassConstructor<IMiddleware>[]
): MethodDecorator & ClassDecorator {
  return function (
    target: object | NewableFunction,
    propertyKey?: string | symbol
  ) {
    if (propertyKey) {
      // Apply to method
      const existingMiddleware: ClassConstructor<IMiddleware>[] =
        Reflect.getMetadata(
          REFLECT_KEYS.MIDDLEWARE,
          target.constructor,
          propertyKey
        ) || [];

      Reflect.defineMetadata(
        REFLECT_KEYS.MIDDLEWARE,
        [...existingMiddleware, ...middlewareClasses],
        target.constructor,
        propertyKey
      );
    } else {
      // Apply to class
      const existingMiddleware: ClassConstructor<IMiddleware>[] =
        Reflect.getMetadata(REFLECT_KEYS.MIDDLEWARE, target) || [];

      Reflect.defineMetadata(
        REFLECT_KEYS.MIDDLEWARE,
        [...existingMiddleware, ...middlewareClasses],
        target
      );
    }
  };
}

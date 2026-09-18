import { REFLECT_KEYS } from "../constant";
import type { ClassConstructor, IGuard } from "../types";

export function UseGuards(
  ...guardClasses: ClassConstructor<IGuard>[]
): MethodDecorator & ClassDecorator {
  return function (
    target: object | NewableFunction,
    propertyKey?: string | symbol
  ) {
    if (propertyKey) {
      // Apply to method
      const existingGuards: ClassConstructor<IGuard>[] =
        Reflect.getMetadata(
          REFLECT_KEYS.GUARD,
          target.constructor,
          propertyKey
        ) || [];

      Reflect.defineMetadata(
        REFLECT_KEYS.GUARD,
        [...existingGuards, ...guardClasses],
        target.constructor,
        propertyKey
      );
    } else {
      // Apply to class
      const existingGuards: ClassConstructor<IGuard>[] =
        Reflect.getMetadata(REFLECT_KEYS.GUARD, target) || [];

      Reflect.defineMetadata(
        REFLECT_KEYS.GUARD,
        [...existingGuards, ...guardClasses],
        target
      );
    }
  };
}

/**
 * A reflection metadata target: a class constructor, optionally narrowed to a
 * single method by `propertyKey`.
 */
export interface IMetadataTarget {
  target: object | NewableFunction;
  propertyKey?: string | symbol;
}

function appendMetadata(
  metadataKey: string,
  values: unknown[],
  target: object | NewableFunction,
  propertyKey?: string | symbol
): void {
  if (propertyKey) {
    // Apply to method — stored on the controller class keyed by method name.
    // Read *own* metadata so a subclass never mutates its base class's array.
    const existing: unknown[] =
      Reflect.getOwnMetadata(metadataKey, target.constructor, propertyKey) ??
      [];

    Reflect.defineMetadata(
      metadataKey,
      [...existing, ...values],
      target.constructor,
      propertyKey
    );
  } else {
    // Apply to class.
    const existing: unknown[] =
      Reflect.getOwnMetadata(metadataKey, target) ?? [];

    Reflect.defineMetadata(metadataKey, [...existing, ...values], target);
  }
}

export type MetadataDecorator = (
  target: object | NewableFunction,
  propertyKey?: string | symbol
) => void;

/**
 * Creates a class/method decorator that accumulates values under
 * `metadataKey`.
 *
 * Use it to build custom decorators (e.g. permissions, roles, feature flags)
 * without repeating the reflection bookkeeping:
 *
 * ```ts
 * const RequireFeature = createFeatureDecorator("app:require:feature");
 *
 * @RequireFeature("reporting")
 * class ReportController {}
 * ```
 *
 * Values declared on a class are stored on the class itself; values declared
 * on a method are stored on the class keyed by the method name. Repeating the
 * decorator appends instead of overwriting.
 */
export function createMetadataDecorator<T>(
  metadataKey: string
): (...values: T[]) => MetadataDecorator {
  return (...values: T[]) =>
    (target, propertyKey) => {
      appendMetadata(metadataKey, values, target, propertyKey);
    };
}

/**
 * Reads and merges metadata written by {@link createMetadataDecorator} from
 * several targets, preserving declaration order.
 *
 * Typical use is to merge class-level and method-level values for a route:
 *
 * ```ts
 * getAllAndMergeMetadata<Permission>(KEY, [
 *   { target: controllerClass },
 *   { target: controllerClass, propertyKey: handlerMethodName },
 * ]);
 * ```
 */
export function getAllAndMergeMetadata<T = unknown>(
  metadataKey: string,
  targets: IMetadataTarget[]
): T[] {
  return targets.flatMap(({ target, propertyKey }) => {
    const value = propertyKey
      ? Reflect.getMetadata(metadataKey, target, propertyKey)
      : Reflect.getMetadata(metadataKey, target);

    return (value as T[] | undefined) ?? [];
  });
}

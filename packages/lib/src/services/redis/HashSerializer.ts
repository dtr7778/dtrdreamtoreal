/**
 * Types supported by the Redis Hash Serializer
 */
export type RedisSupportedTypes =
  string | number | boolean | null | undefined | Date;

/**
 * Utility type to enforce that the object only contains supported types.
 * If an unsupported type (like a nested object or array) is passed,
 * TypeScript will infer its key's value as `never`.
 */
export type EnsureRedisCompatible<T> = {
  [K in keyof T]: T[K] extends RedisSupportedTypes ? T[K] : never;
};

export class HashSerializer {
  private static readonly PREFIX_STRING = "s:";
  private static readonly PREFIX_NUMBER = "n:";
  private static readonly PREFIX_BOOLEAN = "b:";
  private static readonly PREFIX_NULL = "nl:";
  private static readonly PREFIX_UNDEFINED = "ud:";
  private static readonly PREFIX_DATE = "dt:";

  /**
   * Serializes a JS object into a flat Redis hash-compatible object.
   */
  public static serialize<T extends Partial<Record<keyof T & string, unknown>>>(
    obj: EnsureRedisCompatible<T>
  ): Record<string, string> {
    const result: Record<string, string> = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = HashSerializer.serializeValue(obj[key]);
      }
    }

    return result;
  }

  /**
   * Deserializes a Redis hash-compatible object back into a strongly-typed JS object.
   */
  public static deserialize<
    T extends Partial<Record<keyof T & string, RedisSupportedTypes>>,
  >(hash: Record<string, unknown>): T {
    const result: Record<string, unknown> = {};

    for (const key in hash) {
      if (Object.prototype.hasOwnProperty.call(hash, key)) {
        const val = hash[key];
        if (typeof val === "string") {
          result[key] = HashSerializer.deserializeValue(val);
        } else if (val !== null && val !== undefined) {
          result[key] = HashSerializer.deserializeValue(String(val));
        }
      }
    }

    return result as T;
  }

  private static serializeValue(value: RedisSupportedTypes): string {
    if (value === undefined) return `${HashSerializer.PREFIX_UNDEFINED}`;
    if (value === null) return `${HashSerializer.PREFIX_NULL}`;
    if (typeof value === "boolean")
      return `${HashSerializer.PREFIX_BOOLEAN}${value}`;
    if (typeof value === "number")
      return `${HashSerializer.PREFIX_NUMBER}${value}`;
    if (value instanceof Date)
      return `${HashSerializer.PREFIX_DATE}${value.getTime()}`;
    if (typeof value === "string")
      return `${HashSerializer.PREFIX_STRING}${value}`;

    return `${HashSerializer.PREFIX_STRING}${String(value)}`;
  }

  private static deserializeValue(value: string): RedisSupportedTypes {
    if (value.startsWith(HashSerializer.PREFIX_STRING)) {
      return value.slice(HashSerializer.PREFIX_STRING.length);
    }

    if (value.startsWith(HashSerializer.PREFIX_NUMBER)) {
      const numStr = value.slice(HashSerializer.PREFIX_NUMBER.length);
      const num = Number(numStr);
      return isNaN(num) ? numStr : num;
    }

    if (value.startsWith(HashSerializer.PREFIX_BOOLEAN)) {
      const boolStr = value.slice(HashSerializer.PREFIX_BOOLEAN.length);
      return boolStr === "true";
    }

    if (value.startsWith(HashSerializer.PREFIX_NULL)) {
      return null;
    }

    if (value.startsWith(HashSerializer.PREFIX_UNDEFINED)) {
      return undefined;
    }

    if (value.startsWith(HashSerializer.PREFIX_DATE)) {
      const timestamp = Number(value.slice(HashSerializer.PREFIX_DATE.length));
      return new Date(timestamp);
    }
    return value;
  }
}

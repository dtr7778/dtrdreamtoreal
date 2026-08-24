export type NODE_ENV_TYPE = "development" | "test" | "production";

export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

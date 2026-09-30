import type {
  ActionTypeEnumType,
  PermissionLevelEnumType,
  ResourceTypeEnumType,
  RoleEnumType,
} from "@workspace/drizzle/zod-db-enums";

export type NODE_ENV_TYPE = "development" | "test" | "production";

export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

export type HTTPMethods =
  "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

export * from "./contract.types";

export type RoleType = {
  roleName: RoleEnumType;
};

export const permissionSeparator = ".";

export type PermissionStrType =
  `${PermissionLevelEnumType}${typeof permissionSeparator}${ResourceTypeEnumType}${typeof permissionSeparator}${ActionTypeEnumType}`;

export type PermissionType = {
  name: PermissionStrType;
  level: PermissionLevelEnumType;
  resource: ResourceTypeEnumType;
  action: ActionTypeEnumType;
};

export interface InputValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiResponseType<T = unknown> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
  error?: unknown;
  stack?: string;
  inputErrors?: InputValidationError[];
}

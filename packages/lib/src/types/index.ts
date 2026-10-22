import type {
  ActionTypeEnumType,
  PermissionLevelEnumType,
  ResourceTypeEnumType,
  RoleEnumType,
} from "@workspace/drizzle/zod-db-enums";

export * from "./chatRealtime";
export * from "./taskRealtime";

export type NODE_ENV_TYPE = "development" | "test" | "production";

export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

export type HTTPMethods =
  "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

export type RoleType = {
  roleName: RoleEnumType;
};

export type PermissionType = {
  level: PermissionLevelEnumType;
  resource: ResourceTypeEnumType;
  action: ActionTypeEnumType;
};

export interface ApiResponseType<T = unknown> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
  error?: unknown;
  stack?: string;
}

export interface FieldError<TFieldNames> {
  fieldName: TFieldNames;
  message: string;
}

export interface IApiHookInput<TFieldNames = string> {
  onRequestStart?: () => void;
  onRequestEnd?: () => void;
  onSuccess?: (message: string) => void;
  onError?: (errorMessage: string) => void;
  onValidationErrors?: (fields: Array<FieldError<TFieldNames>>) => void;
}

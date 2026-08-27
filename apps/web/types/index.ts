import type { RouteType } from "next/dist/lib/load-custom-routes";

import type {
  ActionTypeEnumType,
  PermissionLevelEnumType,
  ResourceTypeEnumType,
  RoleEnumType,
} from "@workspace/drizzle/zod-db-enums";

import { permissionSeparator } from "@/constants";

export type RoutePathType = __next_route_internal_types__.RouteImpl<RouteType>;

export type AuthUser = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null | undefined;
  banned?: boolean | null | undefined;
  role?: string | null | undefined;
  banReason?: string | null | undefined;
  banExpires?: Date | null | undefined;
  timezone?: string | null | undefined;
  locale?: string | null | undefined;
  currency?: string | null | undefined;
};

export type AuthSession = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
  impersonatedBy?: string | null | undefined;
};

export type RoleType = {
  roleName: RoleEnumType;
};

export type PermissionStrType =
  `${PermissionLevelEnumType}${typeof permissionSeparator}${ResourceTypeEnumType}${typeof permissionSeparator}${ActionTypeEnumType}`;

export type PermissionType = {
  name: PermissionStrType;
  level: PermissionLevelEnumType;
  resource: ResourceTypeEnumType;
  action: ActionTypeEnumType;
};

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

export type BreadcrumbRouteType = {
  title: string;
  path: string;
  children?: BreadcrumbRouteType[];
};

export type SidebarMenuLinkType = {
  title: string;
  path: string;
  pathRegex: RegExp;
  icon?: React.ReactNode | undefined;
  items?: Array<SidebarMenuLinkType> | undefined;
  permissions?: Array<PermissionStrType>;
};

export type SidebarGroupMenuLinkType = {
  groupName?: string;
  items: Array<SidebarMenuLinkType>;
};

import type { RouteType } from "next/dist/lib/load-custom-routes";

import type { AuthType } from "@workspace/auth";
import { type PermissionStrType } from "@workspace/lib/types";

export type RoutePathType = __next_route_internal_types__.RouteImpl<RouteType>;

export type AuthUser = AuthType["$Infer"]["Session"]["user"];

export type AuthSession = AuthType["$Infer"]["Session"]["session"];

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

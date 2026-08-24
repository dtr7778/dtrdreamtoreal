import { RouteType } from "next/dist/lib/load-custom-routes";

import type {
  PermissionDataModel,
  RoleDataModel,
} from "@workspace/drizzle/schemas";

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

export type RoleType = Pick<RoleDataModel, "roleName">;

export type PermissionType = Pick<
  PermissionDataModel,
  "name" | "level" | "resource" | "action"
>;

export interface FieldError<TFieldNames> {
  fieldName: TFieldNames;
  message: string;
}

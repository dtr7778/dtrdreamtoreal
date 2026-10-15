import type { LinkProps } from "@tanstack/react-router";

import type { PermissionType } from "@workspace/lib/types";

export type BreadcrumbRouteType = {
  title: string;
  path: string;
  children?: BreadcrumbRouteType[];
};

export type SidebarMenuLinkType = {
  title: string;
  path: NonNullable<LinkProps["to"]>;
  pathRegex: RegExp;
  icon?: React.ReactNode | undefined;
  items?: Array<SidebarMenuLinkType> | undefined;
  permissions?: Array<PermissionType>;
};

export type SidebarGroupMenuLinkType = {
  groupName?: string;
  items: Array<SidebarMenuLinkType>;
};

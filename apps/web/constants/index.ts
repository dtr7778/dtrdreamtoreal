import { BreadcrumbRouteType, RoutePathType } from "@/types";

export const THEME_COLOR = "#f97770";
export const BACKGROUND_COLOR = "#ffffff";

export const DEFAULT_AUTH_PATH: RoutePathType = "/dashboard";
export const DEFAULT_UNAUTH_PATH: RoutePathType = "/login";
export const RESET_PASSWORD_PATH: RoutePathType = "/reset-password";
export const ERROR_PAGE_PATH: RoutePathType = "/error";

export const SUPPORTED_OAUTH_PROVIDERS = ["google"] as const;

export const AUTH_ROUTES: Array<RoutePathType> = [
  DEFAULT_UNAUTH_PATH,
  "/register",
  "/forget-password",
  RESET_PASSWORD_PATH,
];

export const PUBLIC_ROUTES: Array<RoutePathType> = [...AUTH_ROUTES, "/"];

export const DEFAULT_PAGE_INDEX: number = 1;
export const DEFAULT_PAGE_SIZE: number = 20;

export const DEFAULT_FILE_CACHE_TIMEOUT = 3600;

export const breadcrumbRoutes: Array<BreadcrumbRouteType> = [
  {
    title: "Dashboard",
    path: "/dashboard",
    children: [
      {
        title: "All Users",
        path: "/dashboard/users",
      },
      {
        title: "Settings",
        path: "/dashboard/settings",
        children: [
          {
            title: "Profile",
            path: "/dashboard/settings/profile",
          },
          {
            title: "Update Password",
            path: "/dashboard/settings/update-password",
          },
          {
            title: "Sessions",
            path: "/dashboard/settings/sessions",
          },
          {
            title: "Connected Apps",
            path: "/dashboard/settings/connected-apps",
          },
        ],
      },
    ],
  },
];

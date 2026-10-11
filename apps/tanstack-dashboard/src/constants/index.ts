import type { BreadcrumbRouteType } from "#/types";

export const DEFAULT_UNAUTH_PATH = "/sign-in";
export const DEFAULT_AUTH_PATH = "/";
export const RESET_PASSWORD_PATH = "/reset-password";
export const ERROR_PAGE_PATH = "/auth-error";

export const SUPPORTED_OAUTH_PROVIDERS = ["google"] as const;

export const breadcrumbRoutes: Array<BreadcrumbRouteType> = [
  {
    title: "Dashboard",
    path: "/",
    children: [
      {
        title: "All Users",
        path: "/users",
      },
      {
        title: "Settings",
        path: "/settings",
        children: [
          {
            title: "Profile",
            path: "/settings/profile",
          },
          {
            title: "Update Password",
            path: "/settings/update-password",
          },
          {
            title: "Update Password",
            path: "/settings/notification",
          },
          {
            title: "Sessions",
            path: "/settings/sessions",
          },
          {
            title: "Connected Apps",
            path: "/settings/connected-apps",
          },
        ],
      },
    ],
  },
];

export const DEFAULT_PAGE_INDEX = 1;
export const DEFAULT_PAGE_SIZE = 20;

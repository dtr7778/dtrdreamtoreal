import { RoutePathType } from "@/types";

export const THEME_COLOR = "#f97770";
export const BACKGROUND_COLOR = "#ffffff";

export const DEFAULT_AUTH_PATH: RoutePathType = "/dashboard";
export const DEFAULT_UNAUTH_PATH: RoutePathType = "/login";
export const RESET_PASSWORD_PATH: RoutePathType = "/reset-password";
export const ERROR_PAGE_PATH: RoutePathType = "/error";

export const SUPPORTED_OAUTH_PROVIDERS = ["google"] as const;

import {
  type CsrfTokenCookieOptions,
  type CsrfTokenGenerator,
  doubleCsrf,
  type DoubleCsrfConfigOptions,
  type DoubleCsrfProtection,
} from "csrf-csrf";
import type { HttpError } from "http-errors";

import { IRequest } from "./types";

export interface CsrfConfig {
  secret: string;
  options?: DoubleCsrfConfigOptions;
  cookieOptions?: Omit<
    CsrfTokenCookieOptions,
    "getSecret" | "getSessionIdentifier" | "cookieOptions"
  >;
}

export type ICsrfTokenError = HttpError<number>;

export function createCsrf(options: CsrfConfig): {
  middleware: DoubleCsrfProtection;
  generateToken: CsrfTokenGenerator;
  CsrfTokenError: ICsrfTokenError;
} {
  const { doubleCsrfProtection, generateCsrfToken, invalidCsrfTokenError } =
    doubleCsrf({
      cookieName:
        process.env.NODE_ENV === "production"
          ? "__Host-psifi.x-csrf-token"
          : "psifi.x-csrf-token",
      ...options?.options,
      getSecret: () => options.secret,
      getSessionIdentifier: (req: IRequest) => req.ip ?? "",
      cookieOptions: {
        ...options?.cookieOptions,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
      },
      size: 32,
      getCsrfTokenFromRequest: (req: IRequest) => req.headers["x-csrf-token"],
      ignoredMethods: ["GET", "HEAD", "OPTIONS"],
    });

  return {
    middleware: doubleCsrfProtection,
    generateToken: generateCsrfToken,
    CsrfTokenError: invalidCsrfTokenError,
  };
}

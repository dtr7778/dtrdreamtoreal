import { CsrfError } from "../classes";
import type { INextFunction, IRequest, IResponse } from "../types";
import {
  type CsrfConfig,
  generateCsrfToken,
  resolveCsrfConfig,
  setCsrfCookie,
  shouldProtectRequest,
  validateCsrfToken,
} from "./csrf";

export interface CsrfUtilities {
  /** Generates a CSRF token for the request. */
  generateToken: (req: IRequest) => string;
  /** Sets the generated CSRF token on the response cookie. */
  setCsrfCookie: (res: IResponse, token: string) => void;
  /** Express middleware verifying the CSRF token on mutating requests. */
  middleware: (req: IRequest, _res: IResponse, next: INextFunction) => void;
}

export function createCsrf(config: CsrfConfig): CsrfUtilities {
  const resolvedConfig = resolveCsrfConfig(config);

  return {
    generateToken: (req) => generateCsrfToken(req, resolvedConfig),
    setCsrfCookie: (res, token) => setCsrfCookie(res, token, resolvedConfig),
    middleware: (req: IRequest, _res: IResponse, next: INextFunction) => {
      if (
        !shouldProtectRequest(req, resolvedConfig) ||
        validateCsrfToken(req, resolvedConfig)
      ) {
        next();
        return;
      }

      next(new CsrfError());
    },
  };
}

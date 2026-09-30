import { CsrfError } from "../classes";
import type { INextFunction, IRequest, IResponse } from "../types";
import {
  type CsrfConfig,
  generateCsrfToken,
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
  return {
    generateToken: (req) => generateCsrfToken(req, config),
    setCsrfCookie,
    middleware: (req: IRequest, _res: IResponse, next: INextFunction) => {
      if (
        !shouldProtectRequest(req, config) ||
        validateCsrfToken(req, config)
      ) {
        next();
        return;
      }

      next(new CsrfError());
    },
  };
}

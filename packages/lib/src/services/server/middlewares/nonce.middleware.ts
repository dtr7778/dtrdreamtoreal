import crypto from "node:crypto";

import type { INextFunction, IRequest, IResponse } from "../types";

export function nonceMiddleware() {
  return function (req: IRequest, res: IResponse, next: INextFunction) {
    const nonce = crypto.randomBytes(16).toString("base64");

    res.locals.cspNonce = nonce; // Store in res.locals for Helmet to access
    req.cspNonce = nonce; // Keep for backward compatibility

    res.setHeader("X-Content-Security-Policy-Nonce", nonce);

    next();
  };
}

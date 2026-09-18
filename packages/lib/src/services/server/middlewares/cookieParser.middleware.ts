import cookieParser from "cookie-parser";

import type { INextFunction, IRequest, IResponse } from "../types";

export function cookieParserMiddleware(
  req: IRequest,
  res: IResponse,
  next: INextFunction
) {
  return cookieParser()(req, res, next);
}

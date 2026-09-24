import { CsrfError } from "../classes/CsrfError";
import type { INextFunction, IRequest, IResponse } from "../types";

/**
 * Dedicated error filter for CSRF failures. Responds with the CSRF error and
 * delegates every other error to the following error middleware.
 */
export function csrfErrorMiddleware(
  err: unknown,
  _req: IRequest,
  res: IResponse,
  next: INextFunction
): void {
  if (err instanceof CsrfError) {
    res.status(err.statusCode).json(err.toApiResponse());
    return;
  }

  next(err);
}

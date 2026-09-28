import { injectable } from "inversify";

import type { IGuard, IRequestExecutionContext } from "../framework";

/**
 * Blocks the request unless {@link AuthMiddleware} resolved a session.
 *
 * Apply with `@UseGuards(AuthGuard)` after `@UseMiddleware(AuthMiddleware)`.
 */
@injectable()
export class AuthGuard implements IGuard {
  public canActivate({ request }: IRequestExecutionContext): boolean {
    return request.userAuth != null;
  }
}

import { StatusCodes } from "http-status-codes";
import type { Container } from "inversify";

import { ApiResponse } from "../classes";
import { API_MESSAGE } from "../constant";
import type {
  ClassConstructor,
  IGuard,
  IRequestExecutionContext,
  IResponse,
} from "../types";
import { sendApiResponse } from "../utils";

export class GuardExecutorService {
  public static async executeAllGuards(
    dependencyContainer: Container,
    guardClasses: ClassConstructor<IGuard>[],
    executionContext: IRequestExecutionContext
  ): Promise<boolean> {
    for (const guardClass of guardClasses) {
      const guardInstance = dependencyContainer.get<IGuard>(guardClass);
      const isActivationAllowed =
        await guardInstance.canActivate(executionContext);

      if (!isActivationAllowed) {
        return false;
      }
    }

    return true;
  }

  public static sendForbiddenResponse(response: IResponse): void {
    sendApiResponse(response)(
      new ApiResponse({
        success: false,
        message: API_MESSAGE.FORBIDDEN,
        statusCode: StatusCodes.FORBIDDEN,
        data: null,
      })
    );
  }
}

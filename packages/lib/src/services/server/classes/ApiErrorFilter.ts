import type { IExceptionFilter, IRequestExecutionContext } from "../types";
import { ApiError } from "./ApiError";

export class ApiErrorFilter implements IExceptionFilter {
  public async catch(
    exception: unknown,
    context: IRequestExecutionContext
  ): Promise<void> {
    const { response, nextFunction } = context;

    if (exception instanceof ApiError) {
      response.status(exception.statusCode).json(exception.toApiResponse());
    } else {
      nextFunction(exception);
    }
  }
}

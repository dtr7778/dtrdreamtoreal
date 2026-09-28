import { ApiError } from "../framework/classes/ApiError";
import type {
  IExceptionFilter,
  IRequestExecutionContext,
} from "../framework/types";

export class ApiErrorFilter implements IExceptionFilter {
  public async catch(
    exception: unknown,
    context: IRequestExecutionContext
  ): Promise<void> {
    const { response, nextFunction } = context;

    // Never attempt a second response once headers have been sent.
    if (response.headersSent) {
      if (!response.writableEnded) response.end();
      return;
    }

    if (exception instanceof ApiError) {
      response.status(exception.statusCode).json(exception.toApiResponse());
    } else {
      nextFunction(exception);
    }
  }
}

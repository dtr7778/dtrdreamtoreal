import { StatusCodes } from "http-status-codes";

import { ApiResponse } from "../classes";
import { INextFunction, IRequest, IResponse } from "../types";
import { sendApiResponse } from "../utils";

export function notFoundHandler(
  req: IRequest,
  res: IResponse,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: INextFunction
) {
  return sendApiResponse(res)(
    new ApiResponse({
      statusCode: StatusCodes.NOT_FOUND,
      message: `Route '${req.originalUrl}' not found`,
      data: null,
    })
  );
}

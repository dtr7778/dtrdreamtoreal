import type { NotFoundHandler } from "hono";

import { apiResponse } from "../helpers";
import { NOT_FOUND } from "../utils";

export const notFoundMiddleware: NotFoundHandler = (c) => {
  return apiResponse(c, {
    message: `Route '${c.req.path}' not found`,
    statusCode: NOT_FOUND,
    data: null,
    success: false,
  });
};

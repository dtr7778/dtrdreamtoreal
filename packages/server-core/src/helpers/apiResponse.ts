import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import type { ApiResponseType } from "@workspace/lib/types";

/**
 * Sends the standard API envelope ({ message, statusCode, success, data }) as a
 * JSON Hono response. The body extends `apiOutputSchema` with `statusCode`, and
 * the status is generic so route handlers keep a literal response status.
 */
export function apiResponse<
  T,
  S extends ContentfulStatusCode = ContentfulStatusCode,
>(
  c: Context,
  {
    message,
    data,
    success,
    statusCode,
  }: Omit<ApiResponseType<T>, "statusCode"> & { statusCode: S }
) {
  return c.json({ message, statusCode, success, data }, statusCode);
}

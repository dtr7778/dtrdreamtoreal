import type { ApiResponse } from "../classes";
import type { ApiResponseType, IResponse } from "../types";

/**
 * Standard API response formatter
 * Accepts ApiResponse instance and sends formatted JSON response
 * @param res - Express Response object
 * @returns Function that accepts ApiResponse instance
 * @example
 * const result = new ApiResponse({
 *   statusCode: 200,
 *   message: "Success",
 *   data: user
 * });
 * return sendApiResponse(res)(result);
 */
export function sendApiResponse<T = unknown>(res: IResponse) {
  return function (
    apiResponseInstance: ApiResponse<T> & Partial<ApiResponseType<T>>
  ) {
    return res.status(apiResponseInstance.statusCode).json({
      statusCode: apiResponseInstance.statusCode,
      success:
        apiResponseInstance.success !== undefined
          ? apiResponseInstance.success
          : apiResponseInstance.statusCode >= 200 &&
            apiResponseInstance.statusCode < 400,
      message: apiResponseInstance.message,
      data: apiResponseInstance.data,
      ...(apiResponseInstance.inputErrors?.length
        ? { inputErrors: apiResponseInstance.inputErrors }
        : {}),
      ...(apiResponseInstance.error !== undefined
        ? { error: apiResponseInstance.error }
        : {}),
      ...(apiResponseInstance.stack !== undefined
        ? { stack: apiResponseInstance.stack }
        : {}),
    });
  };
}

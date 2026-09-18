import type { ApiResponse } from "../classes";
import type { IResponse } from "../types";

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
 * return apiResponse(res)(result);
 */
export function apiResponse<T = unknown>(res: IResponse) {
  return function (apiResponseInstance: ApiResponse<T>) {
    return res.status(apiResponseInstance.statusCode).json({
      statusCode: apiResponseInstance.statusCode,
      success:
        apiResponseInstance.success !== undefined
          ? apiResponseInstance.success
          : apiResponseInstance.statusCode >= 200 &&
            apiResponseInstance.statusCode < 400,
      message: apiResponseInstance.message,
      data: apiResponseInstance.data,
    });
  };
}

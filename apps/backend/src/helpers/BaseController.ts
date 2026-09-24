import {
  ApiError,
  ApiErrorFilter,
  ApiResponse,
  UseFilters,
} from "@workspace/lib/server";

type ApiResponseParams<T = unknown> = ConstructorParameters<
  typeof ApiResponse<T>
>[number];
type ApiErrorParams = ConstructorParameters<typeof ApiError>[number];

@UseFilters(ApiErrorFilter)
export abstract class BaseController {
  constructor() {}

  protected response<T>(input: ApiResponseParams<T>): ApiResponse<T> {
    return new ApiResponse(input);
  }
  protected apiError(input: ApiErrorParams): ApiError {
    return new ApiError(input);
  }
}

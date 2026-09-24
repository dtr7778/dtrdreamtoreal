import { StatusCodes } from "http-status-codes";

import { API_MESSAGE } from "../constant";
import { ApiError } from "./ApiError";

export class CsrfError extends ApiError {
  constructor() {
    super({
      statusCode: StatusCodes.FORBIDDEN,
      message: API_MESSAGE.INVALID_CSRF,
    });
    this.name = "CsrfError";
  }
}

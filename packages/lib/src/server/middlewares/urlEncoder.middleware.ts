import express from "express";

import type { INextFunction, IRequest, IResponse } from "../types";

export function urlEncoderMiddleware(
  options?: Parameters<typeof express.urlencoded>[number]
) {
  return function (req: IRequest, res: IResponse, next: INextFunction) {
    return express.urlencoded({ limit: "16kb", ...options, extended: true })(
      req,
      res,
      next
    );
  };
}

import express from "express";

import type { INextFunction, IRequest, IResponse } from "../types";

export function jsonMiddleware(
  options?: Parameters<typeof express.json>[number]
) {
  return function (req: IRequest, res: IResponse, next: INextFunction) {
    const providedVerify = options?.verify;

    return express.json({
      limit: "16kb",
      ...options,
      verify: (
        request: IRequest,
        response: IResponse,
        buffer: Buffer<ArrayBufferLike>,
        encoding: string
      ) => {
        request.rawBody = buffer.toString("utf8");
        if (providedVerify) {
          providedVerify(request, response, buffer, encoding);
        }
      },
    })(req, res, next);
  };
}

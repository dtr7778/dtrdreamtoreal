import express from "express";

import type { INextFunction, IRequest, IResponse } from "../types";

export function jsonMiddleware(
  options?: Parameters<typeof express.json>[number]
) {
  return function (req: IRequest, res: IResponse, next: INextFunction) {
    return express.json({ limit: "16kb", ...options })(req, res, next);
  };
}

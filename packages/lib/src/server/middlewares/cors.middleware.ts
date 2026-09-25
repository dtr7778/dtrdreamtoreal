import cors from "cors";

import type { INextFunction, IRequest, IResponse } from "../types";

export type CorsConfig = {
  allowedOrigins: string[];
};

export function corsMiddleware(config: CorsConfig) {
  return function (req: IRequest, res: IResponse, next: INextFunction) {
    return cors({
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Accept",
        "x-csrf-token",
      ],
      optionsSuccessStatus: 200,
      origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
      ) => {
        if (!origin || config.allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
    })(req, res, next);
  };
}

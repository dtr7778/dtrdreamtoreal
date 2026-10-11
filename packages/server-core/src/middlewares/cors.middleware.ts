import { cors } from "hono/cors";

export interface CorsConfig {
  trustedOrigins: string[];
}

export const corsMiddleware = (config: CorsConfig) =>
  cors({
    origin: (origin) =>
      config.trustedOrigins.includes(origin)
        ? origin
        : config.trustedOrigins[0],
    credentials: true,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  });

import { hc } from "hono/client";

import type { AppType } from "../../../hono-backend/src/app";
import { env } from "./env";

export const apiClient = hc<AppType>(env.VITE_BACKEND_URL, {
  init: {
    credentials: "include",
  },
});

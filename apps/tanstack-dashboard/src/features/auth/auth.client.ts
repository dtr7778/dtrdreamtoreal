import { createClientAuth } from "@workspace/auth/auth-client";

import { env } from "#/lib/env";

export const authClient = createClientAuth({
  baseURL: env.VITE_AUTH_URL,
  googleClientId: env.VITE_GOOGLE_CLIENT_ID,
});

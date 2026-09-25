"use client";

import { createClientAuth } from "@workspace/auth/auth-client";

import { env } from "../env";

export const authClient = createClientAuth({
  baseURL: env.NEXT_PUBLIC_SITE_URL,
  googleClientId: env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID,
});

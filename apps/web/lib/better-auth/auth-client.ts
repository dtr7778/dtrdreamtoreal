"use client";

import {
  adminClient,
  inferAdditionalFields,
  oneTapClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { env } from "../env";
import { systemAc, systemRoles } from "./accessControl.system";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_SITE_URL,
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient({ ac: systemAc, roles: systemRoles }),
    oneTapClient({
      clientId: env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID,
      autoSelect: false,
      cancelOnTapOutside: false,
      context: "signin",
    }),
  ],
});

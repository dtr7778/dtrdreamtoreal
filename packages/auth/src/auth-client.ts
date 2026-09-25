"use client";

import {
  adminClient,
  inferAdditionalFields,
  oneTapClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { systemAc, systemRoles } from "./access-control";
import type { AuthType } from "./auth.config.base";

export interface CreateClientAuthConfig {
  /** Base URL of the auth server (the app that mounts `/api/auth`). */
  baseURL: string;
  /** Google OAuth client id used by the one-tap plugin. */
  googleClientId: string;
}

/**
 * Create a browser auth client wired to the shared access-control roles and
 * the server `AuthType` (so additional user fields are inferred).
 */
export function createClientAuth({
  baseURL,
  googleClientId,
}: CreateClientAuthConfig) {
  return createAuthClient({
    baseURL,
    plugins: [
      inferAdditionalFields<AuthType>(),
      adminClient({ ac: systemAc, roles: systemRoles }),
      oneTapClient({
        clientId: googleClientId,
        autoSelect: false,
        cancelOnTapOutside: false,
        context: "signin",
      }),
    ],
  });
}

export type AuthClient = ReturnType<typeof createClientAuth>;

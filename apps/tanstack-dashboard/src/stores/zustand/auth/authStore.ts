import { env } from "#/lib/env";
import { createStore } from "zustand";
import { combine, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import type { AuthSession, AuthUser } from "@workspace/auth";
import type { PermissionType, RoleType } from "@workspace/lib/types";

export interface AuthStoreState {
  user: AuthUser;
  session: AuthSession;
  roles: Array<RoleType>;
  permissions: Array<PermissionType>;
  isAdminUser: boolean;
}

export interface AuthStoreAction {
  addUserData: (userData: AuthUser) => void;
}

export function authStore(
  userData: AuthUser,
  sessionData: AuthSession,
  roles: Array<RoleType>,
  permissions: Array<PermissionType>,
  isAdminUser: boolean
) {
  return createStore<AuthStoreState & AuthStoreAction>()(
    devtools(
      immer(
        combine<AuthStoreState, AuthStoreAction>(
          {
            user: userData,
            session: sessionData,
            roles,
            permissions,
            isAdminUser,
          },
          (set) => ({
            addUserData: (newUserData) => {
              set((state) => {
                state.user = newUserData;
                return state;
              });
            },
          })
        )
      ),
      {
        name: "auth-store",
        store: "auth-store",
        enabled: env.VITE_ENVIRONMENT === "development",
      }
    )
  );
}

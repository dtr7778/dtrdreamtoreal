"use client";

import { createContext, useContext, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { StoreApi, useStore } from "zustand";

import { orpcTQClient } from "@/server/orpc.client";

import { authStore, AuthStoreAction, AuthStoreState } from "./authStore";

const AuthStoreContext = createContext<StoreApi<
  AuthStoreState & AuthStoreAction
> | null>(null);

export function AuthStoreProvider({ children }: { children: React.ReactNode }) {
  const {
    data: {
      data: { user, session, roles, permissions, isAdminUser },
    },
  } = useSuspenseQuery(
    orpcTQClient.auth.metadata.queryOptions({
      staleTime: Infinity,
    })
  );

  const [store] = useState<StoreApi<AuthStoreState & AuthStoreAction>>(() =>
    authStore(user, session, roles, permissions, isAdminUser)
  );

  return (
    <AuthStoreContext.Provider value={store}>
      {children}
    </AuthStoreContext.Provider>
  );
}

export function useAuthStore<T>(
  selector: (state: AuthStoreState & AuthStoreAction) => T
) {
  const store = useContext(AuthStoreContext);
  if (!store) {
    throw new Error("AuthStoreProvider is not found");
  }
  return useStore(store, selector);
}

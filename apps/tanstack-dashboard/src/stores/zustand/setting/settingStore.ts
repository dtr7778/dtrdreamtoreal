import { env } from "#/lib/env";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

const STORAGE_KEY = "settings";

export interface SettingState {
  notification: {
    promptDismissed: boolean;
  };
  sidebar: {
    open: boolean;
  };
}

export interface SettingAction {
  dismissNotificationPrompt: () => void;
  setNotificationPromptDismissed: (dismissed: boolean) => void;
  resetNotificationPrompt: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarOpen: () => void;
}

export type SettingStore = SettingState & SettingAction;

const initialState: SettingState = {
  notification: {
    promptDismissed: false,
  },
  sidebar: {
    open: true,
  },
};

export const useSettingStore = create<SettingStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        dismissNotificationPrompt: () =>
          set(
            (state) => ({
              notification: { ...state.notification, promptDismissed: true },
            }),
            false,
            `${STORAGE_KEY}/dismissNotificationPrompt`
          ),
        setNotificationPromptDismissed: (dismissed) =>
          set(
            (state) => ({
              notification: {
                ...state.notification,
                promptDismissed: dismissed,
              },
            }),
            false,
            `${STORAGE_KEY}/setNotificationPromptDismissed`
          ),
        resetNotificationPrompt: () =>
          set(
            (state) => ({
              notification: { ...state.notification, promptDismissed: false },
            }),
            false,
            `${STORAGE_KEY}/resetNotificationPrompt`
          ),
        setSidebarOpen: (open) =>
          set(
            (state) => ({
              sidebar: { ...state.sidebar, open },
            }),
            false,
            `${STORAGE_KEY}/setSidebarOpen`
          ),
        toggleSidebarOpen: () =>
          set(
            (state) => ({
              sidebar: { ...state.sidebar, open: !state.sidebar.open },
            }),
            false,
            `${STORAGE_KEY}/toggleSidebarOpen`
          ),
      }),
      {
        name: STORAGE_KEY,
        version: 0,
        storage: createJSONStorage(() => window.localStorage),
      }
    ),
    {
      name: STORAGE_KEY,
      enabled: env.VITE_ENVIRONMENT === "development",
    }
  )
);

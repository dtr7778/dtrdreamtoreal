/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/vite/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

import type {
  NotificationCategoryEnumType,
  NotificationLevelEnumType,
} from "@workspace/drizzle/zod-db-enums";

import { DEFAULT_AUTH_PATH } from "./constants";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

type PushPayload = {
  id: string;
  title: string;
  message: string;
  data: unknown;
  recipientId: string;
  actorId: string | null;
  orgId: string | null;
  category: NotificationCategoryEnumType;
  level: NotificationLevelEnumType;
  isRead: boolean;
  readAt: Date | null;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

self.addEventListener("push", (e) => {
  const payload = e.data?.json() as PushPayload | null;
  if (!payload) return;

  async function handlePush() {
    if (!payload) return;

    try {
      const windowClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      const appInFocused = windowClients.some((client) => client.focused);
      if (appInFocused) return;

      await self.registration.showNotification(payload.title, {
        body: payload.message,
        data: payload.data,
      });
    } catch (error) {
      console.error("Failed to show notification:", error);
    }
  }

  e.waitUntil(handlePush());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url ?? DEFAULT_AUTH_PATH;
  if (event.action === "dismiss") return;

  async function handleClick() {
    const windowClients = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });
    for (const client of windowClients) {
      if (client.url === targetUrl && "focus" in client) {
        return client.focus();
      }
    }
    return self.clients.openWindow(targetUrl);
  }

  event.waitUntil(handleClick());
});

self.addEventListener("notificationclose", () => {});

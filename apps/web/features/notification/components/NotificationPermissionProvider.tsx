"use client";

import { useCallback, useEffect, useState } from "react";

import { X } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Portal } from "@workspace/ui/components/portal";

import { env } from "@/lib/env";

import useLocalStorage from "@/hooks/use-local-storage";
import { orpcClient } from "@/server/orpc.client";
import { detectDevice, type DevicePlatform } from "@/utils/detectDevice";

import {
  isPushManagerSupported,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from "../data/push-notification";

function isSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    isPushManagerSupported()
  );
}

function isIOSStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function checkPermission(): NotificationPermission {
  if (!isSupported()) return "denied";
  return Notification.permission;
}

// iOS in a regular browser tab — push is completely unsupported
function isPushSupportedOnPlatform(platform: DevicePlatform): boolean {
  if (platform === "ios") return isIOSStandalone();
  return isSupported();
}

async function requestPlatformPermission(
  platform: DevicePlatform
): Promise<NotificationPermission> {
  if (!isPushSupportedOnPlatform(platform)) {
    if (platform === "ios") {
      console.warn(
        "iOS push notifications require the app to be added to the Home Screen as a PWA."
      );
    }
    return "denied";
  }
  return Notification.requestPermission();
}

async function subscribePushSubscription(): Promise<void> {
  const subscription = await subscribeToPushNotifications(
    env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY
  );
  const { endpoint, keys, expirationTime } = subscription.toJSON();
  if (endpoint && keys?.p256dh && keys?.auth) {
    await orpcClient.notification.subscribe({
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      expirationTime,
    });
  }
}

async function unsubscribePushSubscription(): Promise<void> {
  const unsubscribed = await unsubscribeFromPushNotifications();
  if (unsubscribed) {
    await orpcClient.notification.unsubscribe();
  }
}

export function NotificationPermissionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  const [{ platform }] = useState(() => detectDevice());

  const requestPermission =
    useCallback(async (): Promise<NotificationPermission> => {
      try {
        const result = await requestPlatformPermission(platform);
        setPermission(result);

        if (result === "granted") {
          await subscribePushSubscription();
        } else if (result === "denied") {
          await unsubscribePushSubscription();
        }

        return result;
      } catch (error) {
        console.error("Notification permission request failed:", error);
        return "denied";
      }
    }, [platform, setPermission]);

  // On mount: sync current permission state into store.
  // Never auto-prompt — let the card handle that via user gesture.
  useEffect(() => {
    (async () => {
      try {
        const currentPermission = checkPermission();
        queueMicrotask(() => {
          setPermission(currentPermission);
        });
        if (currentPermission === "denied") {
          await unsubscribePushSubscription();
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // Show the prompt card if:
  // - push is supported on this platform
  // - permission hasn't been decided yet
  const showPrompt =
    isPushSupportedOnPlatform(platform) && permission === "default";

  return (
    <>
      {children}
      {showPrompt && (
        <NotificationPromptCard
          platform={platform}
          onAllow={requestPermission}
        />
      )}
    </>
  );
}

// iOS PWA must only prompt on user gesture, never on mount
function requiresGesture(platform: DevicePlatform): boolean {
  return platform === "ios";
}

function NotificationPromptCard({
  platform,
  onAllow,
}: {
  platform: DevicePlatform;
  onAllow: () => void;
}) {
  const [dismissed, setDismissed] = useLocalStorage<boolean>(
    "notification.dismissed",
    false
  );

  if (dismissed) return null;

  const isIOS = platform === "ios";

  return (
    <Portal className="pointer-events-none">
      <Card className="absolute bottom-4 right-4 pointer-events-auto w-80 shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm leading-snug">
              {isIOS ? "Enable notifications (PWA)" : "Stay in the loop"}
            </CardTitle>
            <button
              onClick={() => setDismissed(true)}
              className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
          <CardDescription className="text-xs">
            {isIOS
              ? "Tap Allow below. Make sure this app is added to your Home Screen first."
              : "Get real-time updates by allowing push notifications."}
          </CardDescription>
        </CardHeader>
        {/* Remind iOS users this only works as a PWA */}
        {requiresGesture(platform) && (
          <CardContent>
            <p className="mt-1 text-xs text-muted-foreground">
              Not seeing a prompt? Open in Safari and tap{" "}
              <strong>Share → Add to Home Screen</strong>.
            </p>
          </CardContent>
        )}
        <CardFooter className="gap-2">
          <Button onClick={onAllow} className="flex-1">
            Allow
          </Button>
          <Button
            variant="outline"
            onClick={() => setDismissed(true)}
            className="flex-1"
          >
            Not now
          </Button>
        </CardFooter>
      </Card>
    </Portal>
  );
}

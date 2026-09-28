"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { Sparkles, X } from "lucide-react";

import { announcement } from "../content/home";

const STORAGE_KEY = "dtr-announcement-dismissed";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

function getServerSnapshot() {
  return true;
}

function dismiss() {
  window.localStorage.setItem(STORAGE_KEY, "1");
  for (const listener of listeners) listener();
}

export function AnnouncementBar() {
  const dismissed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  if (dismissed) return null;

  return (
    <div className="relative bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-10 py-2.5 text-center text-xs sm:text-sm">
        <Sparkles aria-hidden="true" className="hidden size-4 sm:block" />
        <span>{announcement.text}</span>
        <Link
          href={announcement.cta.href}
          className="hidden font-medium underline underline-offset-4 hover:no-underline sm:inline"
        >
          {announcement.cta.label}
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="absolute inset-e-3 flex size-7 items-center justify-center rounded-full transition-colors hover:bg-primary-foreground/15"
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

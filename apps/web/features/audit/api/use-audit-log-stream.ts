"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type {
  AuditLogEventTypeEnumType,
  AuditLogLevelEnumType,
} from "@workspace/drizzle/zod-db-enums";

import { env } from "@/lib/env";

export interface AuditLogStreamEvent {
  sequence: number;
  siteAuditId: string;
  type: AuditLogEventTypeEnumType;
  level: AuditLogLevelEnumType;
  message: string;
  data: Record<string, unknown> | null;
  timestamp: string;
}

export type AuditLogStreamStatus =
  | "idle"
  | "connecting"
  | "open"
  | "reconnecting"
  | "closed"
  | "error";

const TERMINAL_EVENT_TYPES: ReadonlyArray<string> = [
  "run_completed",
  "run_failed",
];

const MAX_EVENTS = 1000;

/**
 * Subscribes to the backend Server-Sent Events log stream of a site audit.
 *
 * The endpoint serves persisted events for finished runs and live-tails
 * in-progress runs, so the same hook works before, during, and after a run.
 * The connection is closed automatically once a terminal event is received.
 */
export function useAuditLogStream(
  auditId: string | null,
  options?: { enabled?: boolean; terminal?: boolean }
) {
  const enabled = options?.enabled ?? true;
  const terminal = options?.terminal ?? false;

  const [events, setEvents] = useState<Array<AuditLogStreamEvent>>([]);
  const [status, setStatus] = useState<AuditLogStreamStatus>("idle");
  const sourceRef = useRef<EventSource | null>(null);
  const terminalRef = useRef(terminal);

  useEffect(() => {
    terminalRef.current = terminal;
  }, [terminal]);

  const streamKey = enabled && auditId ? auditId : null;
  const [activeKey, setActiveKey] = useState<string | null>(streamKey);

  if (streamKey !== activeKey) {
    setActiveKey(streamKey);
    setEvents([]);
    setStatus(streamKey ? "connecting" : "idle");
  }

  const reset = useCallback(() => {
    setEvents([]);
    setStatus("idle");
  }, []);

  useEffect(() => {
    if (!enabled || !auditId) return;

    const source = new EventSource(
      `${env.NEXT_PUBLIC_BACKEND_URL}/site-audits/${auditId}/logs`,
      { withCredentials: true }
    );
    sourceRef.current = source;

    let closedByTerminal = false;

    const handleEvent = (message: MessageEvent<string>) => {
      let event: AuditLogStreamEvent;
      try {
        event = JSON.parse(message.data) as AuditLogStreamEvent;
      } catch {
        return;
      }

      setEvents((prev) => {
        if (prev.some((existing) => existing.sequence === event.sequence)) {
          return prev;
        }
        const next = [...prev, event];
        return next.length > MAX_EVENTS
          ? next.slice(next.length - MAX_EVENTS)
          : next;
      });

      if (TERMINAL_EVENT_TYPES.includes(event.type)) {
        closedByTerminal = true;
        setStatus("closed");
        source.close();
      }
    };

    source.addEventListener("open", () => setStatus("open"));
    source.addEventListener("audit-log", handleEvent as EventListener);
    source.addEventListener("error", () => {
      if (closedByTerminal) return;
      // Finished runs replay their persisted history and then close the
      // connection; there is nothing left to tail, so stop reconnecting.
      if (terminalRef.current) {
        closedByTerminal = true;
        source.close();
        setStatus("closed");
        return;
      }
      setStatus(
        source.readyState === EventSource.CONNECTING ? "reconnecting" : "error"
      );
    });

    return () => {
      closedByTerminal = true;
      source.close();
      sourceRef.current = null;
    };
  }, [auditId, enabled]);

  const close = useCallback(() => {
    sourceRef.current?.close();
    sourceRef.current = null;
    setStatus("closed");
  }, []);

  const isStreaming =
    status === "connecting" ||
    status === "open" ||
    status === "reconnecting";

  return { events, status, isStreaming, reset, close };
}

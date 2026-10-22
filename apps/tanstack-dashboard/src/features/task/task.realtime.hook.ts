import { useEffect } from "react";

import { apiClient } from "#/lib/hono-api";
import { orpcTQClient } from "#/server/orpc";
import { useQueryClient } from "@tanstack/react-query";

import type {
  TaskRealtimeClientEvent,
  TaskRealtimeScope,
  TaskRealtimeServerEvent,
} from "@workspace/lib/types";

const PING_INTERVAL_MS = 25000;
const RECONNECT_DELAY_MS = 2000;

/**
 * Keeps one board in sync with the task hub. Events only carry ids, so a
 * matching change simply refetches that board through oRPC.
 */
export function useTaskRealtime(scope: TaskRealtimeScope) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window === "undefined") return;

    let disposed = false;
    let socket: WebSocket | undefined;
    let pingTimer: ReturnType<typeof setInterval> | undefined;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    const listKey =
      scope === "company"
        ? orpcTQClient.task.company.list.queryKey({ input: {} })
        : orpcTQClient.task.personal.list.queryKey({ input: {} });

    const stopPing = () => {
      if (pingTimer) clearInterval(pingTimer);
      pingTimer = undefined;
    };

    const connect = () => {
      socket = new WebSocket(apiClient.task.ws.$url());

      socket.onopen = () => {
        stopPing();
        pingTimer = setInterval(() => {
          if (socket?.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({ type: "ping" } satisfies TaskRealtimeClientEvent)
            );
          }
        }, PING_INTERVAL_MS);
      };

      socket.onmessage = (messageEvent) => {
        let event: TaskRealtimeServerEvent;
        try {
          event = JSON.parse(
            messageEvent.data as string
          ) as TaskRealtimeServerEvent;
        } catch {
          return;
        }

        if (event.type === "task_changed" && event.data.scope === scope) {
          void queryClient.invalidateQueries({
            queryKey: listKey,
            exact: false,
          });
        }
      };

      socket.onclose = () => {
        stopPing();
        if (!disposed) reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
      };

      socket.onerror = () => socket?.close();
    };

    connect();

    return () => {
      disposed = true;
      stopPing();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [queryClient, scope]);
}

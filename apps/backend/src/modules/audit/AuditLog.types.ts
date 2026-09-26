import { z } from "zod";

import {
  AuditLogEventTypeEnumSchema,
  AuditLogLevelEnumSchema,
} from "@workspace/drizzle/zod-db-enums";

/** Event types that mark the end of a run's live log stream. */
export const AUDIT_LOG_TERMINAL_EVENTS = [
  "run_completed",
  "run_failed",
] as const;

export const auditLogEventSchema = z.object({
  /** Monotonic per-run sequence, also used as the SSE `id`. */
  sequence: z.number().int().nonnegative(),
  siteAuditId: z.uuid(),
  type: AuditLogEventTypeEnumSchema,
  level: AuditLogLevelEnumSchema,
  message: z.string(),
  data: z.record(z.string(), z.unknown()).nullable(),
  timestamp: z.string(),
});

export type AuditLogEvent = z.infer<typeof auditLogEventSchema>;
export type AuditLogEventType = AuditLogEvent["type"];
export type AuditLogLevel = AuditLogEvent["level"];
export type AuditLogEventData = NonNullable<AuditLogEvent["data"]>;

/** Payload accepted by {@link AuditLogService.publish}; the service fills the rest. */
export interface AuditLogEventInput {
  type: AuditLogEventType;
  message: string;
  level?: AuditLogLevel;
  data?: AuditLogEventData;
}

export function isTerminalAuditLogEvent(type: AuditLogEventType): boolean {
  return (AUDIT_LOG_TERMINAL_EVENTS as readonly string[]).includes(type);
}

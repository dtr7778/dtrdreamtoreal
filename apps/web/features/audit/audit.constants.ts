import z from "zod";

import {
  AuditItemStatusEnumSchema,
  AuditStatusEnumSchema,
} from "@workspace/drizzle/zod-db-enums";
import type { StatusVariant } from "@workspace/ui/components/status";

export type AuditStatus = z.infer<typeof AuditStatusEnumSchema>;
export type AuditItemStatus = z.infer<typeof AuditItemStatusEnumSchema>;

export const AUDIT_STATUS_VARIANT: Record<AuditStatus, StatusVariant> = {
  pending: "warning",
  running: "info",
  completed: "success",
  failed: "error",
  partial: "warning",
  cancelled: "default",
};

export const AUDIT_ITEM_STATUS_VARIANT: Record<AuditItemStatus, StatusVariant> =
  {
    pending: "default",
    running: "info",
    passed: "success",
    failed: "error",
    warning: "warning",
    needs_review: "warning",
    error: "error",
    skipped: "default",
  };

export const AUDIT_ACTIVE_STATUSES: ReadonlyArray<AuditStatus> = [
  "pending",
  "running",
];

export function isAuditActive(status: AuditStatus): boolean {
  return AUDIT_ACTIVE_STATUSES.includes(status);
}

export function getAuditScore(passed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((passed / total) * 100);
}

export function humanizeAuditSection(section: string): string {
  return section
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

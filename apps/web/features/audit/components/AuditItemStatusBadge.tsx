import { formatEnumValue } from "@workspace/lib/utils";
import {
  Status,
  StatusIndicator,
  StatusLabel,
} from "@workspace/ui/components/status";

import {
  AUDIT_ITEM_STATUS_VARIANT,
  type AuditItemStatus,
} from "../audit.constants";

export function AuditItemStatusBadge({ status }: { status: AuditItemStatus }) {
  return (
    <Status variant={AUDIT_ITEM_STATUS_VARIANT[status] ?? "default"}>
      {status === "running" && (
        <StatusIndicator className="motion-reduce:before:animate-none" />
      )}
      <StatusLabel>{formatEnumValue(status)}</StatusLabel>
    </Status>
  );
}

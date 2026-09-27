import { formatEnumValue } from "@workspace/lib/utils";
import {
  Status,
  StatusIndicator,
  StatusLabel,
} from "@workspace/ui/components/status";

import {
  AUDIT_STATUS_VARIANT,
  isAuditActive,
  type AuditStatus,
} from "../audit.constants";

export function AuditStatusBadge({ status }: { status: AuditStatus }) {
  return (
    <Status variant={AUDIT_STATUS_VARIANT[status] ?? "default"}>
      {isAuditActive(status) && (
        <StatusIndicator className="motion-reduce:before:animate-none" />
      )}
      <StatusLabel>{formatEnumValue(status)}</StatusLabel>
    </Status>
  );
}

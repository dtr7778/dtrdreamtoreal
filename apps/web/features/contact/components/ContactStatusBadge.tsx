import { ContactSubmissionStatusEnumType } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import {
  Status,
  StatusIndicator,
  StatusLabel,
  StatusVariant,
} from "@workspace/ui/components/status";

const statusVariantMap: Record<ContactSubmissionStatusEnumType, StatusVariant> =
  {
    PENDING: "info",
    REPLIED: "default",
    SPAM: "error",
  };

export function ContactStatusBadge({
  status,
}: {
  status: ContactSubmissionStatusEnumType;
}) {
  return (
    <Status variant={statusVariantMap[status] || "default"}>
      {status === "PENDING" && <StatusIndicator />}
      <StatusLabel>{formatEnumValue(status)}</StatusLabel>
    </Status>
  );
}

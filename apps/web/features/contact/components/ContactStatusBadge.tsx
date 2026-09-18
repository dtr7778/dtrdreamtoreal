import { ContactStatusEnumType } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import {
  Status,
  StatusIndicator,
  StatusLabel,
  StatusVariant,
} from "@workspace/ui/components/status";

const statusVariantMap: Record<ContactStatusEnumType, StatusVariant> = {
  pending: "warning",
  processing: "info",
  replied: "success",
  closed: "default",
  spam: "error",
};

export function ContactStatusBadge({
  status,
}: {
  status: ContactStatusEnumType;
}) {
  return (
    <Status variant={statusVariantMap[status] || "default"}>
      {status === "pending" && <StatusIndicator />}
      <StatusLabel>{formatEnumValue(status)}</StatusLabel>
    </Status>
  );
}

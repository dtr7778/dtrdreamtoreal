import { TaskPriorityEnumType } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import { Badge } from "@workspace/ui/components/badge";

export function TaskPriorityBadge({
  priority,
}: {
  priority: TaskPriorityEnumType;
}) {
  const variant =
    priority === "high"
      ? "destructive"
      : priority === "medium"
        ? "secondary"
        : "outline";

  return (
    <Badge variant={variant} className="shrink-0">
      {formatEnumValue(priority)}
    </Badge>
  );
}

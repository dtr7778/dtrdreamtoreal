import { useCallback, useState } from "react";

import {
  Briefcase,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  Headphones,
  type LucideIcon,
  Package,
  Settings2,
  ShieldAlert,
} from "lucide-react";

import { formatEnumValue } from "@workspace/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

import { useNotificationMarkAsRead } from "../api/notification.api.hook";
import { ListNotificationContractType } from "../api/notification.contract";

const CATEGORY_CONFIG: Record<string, { label: string; Icon: LucideIcon }> = {
  SYSTEM: { label: "System", Icon: Settings2 },
  ORG: { label: "Organization", Icon: Building2 },
  AUTH: { label: "Auth", Icon: ShieldAlert },
  SUPPORT: { label: "Support", Icon: Headphones },
  LEAD: { label: "Lead", Icon: Briefcase },
  JOB: { label: "Job", Icon: Package },
};

const LEVEL_CONFIG = {
  INFO: {
    iconClass: "text-blue-400",
    bgClass: "bg-blue-500/10",
    badgeClass: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  },
  SUCCESS: {
    iconClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  WARNING: {
    iconClass: "text-amber-400",
    bgClass: "bg-amber-500/10",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  },
  ERROR: {
    iconClass: "text-red-400",
    bgClass: "bg-red-500/10",
    badgeClass: "bg-red-500/15 text-red-400 border-red-500/20",
  },
};

function timeAgo(date: string | Date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface NotificationItemProps extends React.ComponentProps<"div"> {
  notification: ListNotificationContractType["output"]["data"]["data"][number];
}

export function NotificationItem({
  notification,
  className,
  ...props
}: NotificationItemProps) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const level = LEVEL_CONFIG[notification.level];
  const { Icon, label: catLabel } = CATEGORY_CONFIG[notification.category]!;

  const { mutate: markAsRead, isPending } = useNotificationMarkAsRead();

  const handleToggleExpanded = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      setExpanded((p) => !p);
    },
    []
  );

  const handleMarkAsRead = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      markAsRead({ ids: [notification.id] });
    },
    [notification.id, markAsRead]
  );

  return (
    <div
      className={cn(
        "group relative flex gap-3 pl-2 pr-3 py-3 transition-colors duration-150 select-none ",
        notification.isRead
          ? "hover:bg-secondary/50"
          : "bg-accent/10 hover:bg-accent/20",
        className
      )}
      {...props}
    >
      {/* Category Icon */}
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          level.bgClass
        )}
      >
        <Icon className={cn("size-4", level.iconClass)} />
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 items-start flex-col gap-1">
        {/* Meta row */}
        <div className="flex flex-wrap w-full items-center gap-1.5">
          <Badge
            variant="outline"
            className="h-4 rounded px-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
          >
            {formatEnumValue(catLabel)}
          </Badge>
          <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">
            {timeAgo(notification.createdAt)}
          </span>
        </div>

        {/* Title */}
        <p className="text-sm leading-snug font-medium">{notification.title}</p>

        {/* Message */}
        <p
          className={cn(
            "text-xs leading-relaxed text-muted-foreground",
            !expanded && "line-clamp-1"
          )}
        >
          {notification.message}
        </p>

        {/* Expand toggle */}
        <button
          className="inline-flex w-fit items-center gap-0.5 text-xs text-muted-foreground cursor-pointer transition-colors hover:text-foreground"
          onClick={handleToggleExpanded}
        >
          {expanded ? (
            <>
              <ChevronUp className="size-4" />
              <span>less</span>
            </>
          ) : (
            <>
              <ChevronDown className="size-4" />
              <span>more</span>
            </>
          )}
        </button>

        {!notification.isRead && (
          <Button
            size="xs"
            variant="outline"
            className="cursor-pointer"
            onClick={handleMarkAsRead}
            disabled={isPending}
            aria-disabled={isPending}
          >
            <Check />
            <span>Mark read</span>
          </Button>
        )}
      </div>
    </div>
  );
}

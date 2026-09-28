"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Activity,
  CalendarDays,
  CalendarRange,
  Laptop,
  type LucideIcon,
  MonitorSmartphone,
  ShieldAlert,
  Smartphone,
  UsersRound,
} from "lucide-react";

import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Stat,
  StatIndicator,
  StatLabel,
  StatTrend,
  StatValue,
} from "@workspace/ui/components/stat";
import {
  Status,
  StatusIndicator,
  StatusLabel,
} from "@workspace/ui/components/status";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { orpcTQClient } from "@/server/orpc.client";

type Trend = "up" | "down" | "neutral";
type IndicatorColor = "default" | "success" | "info" | "warning" | "error";

interface StatCard {
  key: string;
  label: string;
  value: number;
  icon: LucideIcon;
  color: IndicatorColor;
  trend: { label: string; trend: Trend };
  live?: boolean;
}

function formatGrowth(growth: number | null): {
  label: string;
  trend: Trend;
} {
  if (growth === null) return { label: "No prior data", trend: "neutral" };
  const sign = growth >= 0 ? "+" : "";
  const trend = growth > 0 ? "up" : growth < 0 ? "down" : "neutral";
  return { label: `${sign}${growth}% vs last period`, trend };
}

export function UserStats() {
  const { data, isLoading, isError, error } = useSuspenseQuery(
    orpcTQClient.user.stats.queryOptions()
  );

  return (
    <QueryStateBoundary
      isLoading={isLoading}
      isError={isError}
      error={error}
      data={data}
      isEmpty={() => false}
      loadingFallback={
        <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
      }
    >
      {({ data }) => {
        const cards: StatCard[] = [
          {
            key: "totalUsers",
            label: "Total Users",
            value: data.totalUsers,
            icon: UsersRound,
            color: "info",
            trend: formatGrowth(data.totalUsersGrowth),
          },
          {
            key: "activeNow",
            label: "Active Now",
            value: data.activeNow,
            icon: Activity,
            color: "success",
            trend: { label: "last 5 minutes", trend: "neutral" },
            live: true,
          },
          {
            key: "activeSessions",
            label: "Active Sessions",
            value: data.activeSessions,
            icon: MonitorSmartphone,
            color: "info",
            trend: { label: "open & unexpired", trend: "neutral" },
          },
          {
            key: "totalDevices",
            label: "Known Devices",
            value: data.totalDevices,
            icon: Laptop,
            color: "default",
            trend: { label: "across all users", trend: "neutral" },
          },
          {
            key: "newDevices",
            label: "New Devices",
            value: data.newDevices,
            icon: Smartphone,
            color: "success",
            trend: { label: "first seen in last 7 days", trend: "neutral" },
          },
          {
            key: "wau",
            label: "Weekly Active Users",
            value: data.wau,
            icon: CalendarDays,
            color: "warning",
            trend: formatGrowth(data.wauGrowth),
          },
          {
            key: "mau",
            label: "Monthly Active Users",
            value: data.mau,
            icon: CalendarRange,
            color: "default",
            trend: formatGrowth(data.mauGrowth),
          },
          {
            key: "failedLogins",
            label: "Failed Logins",
            value: data.failedLogins,
            icon: ShieldAlert,
            color: data.failedLogins > 0 ? "error" : "success",
            trend: {
              label: "last 24 hours",
              trend: data.failedLogins > 0 ? "down" : "neutral",
            },
          },
        ];

        return (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Stat key={card.key}>
                  <StatLabel>
                    {card.live ? (
                      <Status variant="success">
                        <StatusIndicator className="motion-reduce:before:animate-none" />
                        <StatusLabel>{card.label}</StatusLabel>
                      </Status>
                    ) : (
                      card.label
                    )}
                  </StatLabel>
                  <StatIndicator variant="icon" color={card.color}>
                    <Icon aria-hidden />
                  </StatIndicator>
                  <StatValue>{card.value}</StatValue>
                  <StatTrend trend={card.trend.trend}>
                    {card.trend.label}
                  </StatTrend>
                </Stat>
              );
            })}
          </div>
        );
      }}
    </QueryStateBoundary>
  );
}

"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { UsersRound } from "lucide-react";

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

function formatGrowth(growth: number | null): {
  label: string;
  trend: "up" | "down" | "neutral";
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
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
          <Skeleton className="w-full h-28" />
          <Skeleton className="w-full h-28" />
          <Skeleton className="w-full h-28" />
          <Skeleton className="w-full h-28" />
        </div>
      }
    >
      {({ data }) => {
        const totalUsersGrowth = formatGrowth(data.totalUsersGrowth);
        const wauGrowth = formatGrowth(data.wauGrowth);
        const mauGrowth = formatGrowth(data.mauGrowth);
        return (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
            <Stat>
              <StatLabel>Total Users</StatLabel>
              <StatIndicator variant="icon" color="info">
                <UsersRound />
              </StatIndicator>
              <StatValue>{data.totalUsers.toLocaleString()}</StatValue>
              <StatTrend trend={totalUsersGrowth.trend}>
                {totalUsersGrowth.label}
              </StatTrend>
            </Stat>
            <Stat>
              <StatLabel>
                <Status variant="success">
                  <StatusIndicator />
                  <StatusLabel>Active Now</StatusLabel>
                </Status>
              </StatLabel>
              <StatIndicator variant="icon" color="success">
                <UsersRound />
              </StatIndicator>
              <StatValue>{data.activeNow.toLocaleString()}</StatValue>
              <StatTrend trend="neutral">last 5 minutes</StatTrend>
            </Stat>
            <Stat>
              <StatLabel>Weekly unique user</StatLabel>
              <StatIndicator variant="icon" color="warning">
                <UsersRound />
              </StatIndicator>
              <StatValue>{data.wau.toLocaleString()}</StatValue>
              <StatTrend trend={wauGrowth.trend}>{wauGrowth.label}</StatTrend>
            </Stat>
            <Stat>
              <StatLabel>Monthly unique user</StatLabel>
              <StatIndicator variant="icon">
                <UsersRound />
              </StatIndicator>
              <StatValue>{data.mau.toLocaleString()}</StatValue>
              <StatTrend trend={mauGrowth.trend}>{mauGrowth.label}</StatTrend>
            </Stat>
          </div>
        );
      }}
    </QueryStateBoundary>
  );
}

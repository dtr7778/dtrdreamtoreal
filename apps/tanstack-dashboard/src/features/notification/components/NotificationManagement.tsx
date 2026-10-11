import { useCallback, useMemo, useState } from "react";

import { MetaPagination } from "#/components/MetaPagination";
import { useQuerySearch } from "#/hooks/use-query-search";
import { orpcTQClient } from "#/server/orpc";
import { useQuery } from "@tanstack/react-query";
import { CheckCheck, CircleQuestionMark } from "lucide-react";

import type { NotificationCategoryEnumType } from "@workspace/drizzle/zod-db-enums";
import { NotificationCategoryEnumSchema } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Input } from "@workspace/ui/components/input";
import { QueryStateBoundary } from "@workspace/ui/components/tanstack-query/query-state-boundary";
import { useDebouncedCallback } from "@workspace/ui/hooks/use-debounced-callback";

import { useNotificationMarkAsRead } from "../api/notification.api.hook";
import { NotificationItem } from "./NotificationItem";

export function NotificationManagement({
  search,
  searchFields,
}: {
  search: string | null | undefined;
  searchFields?: string[] | null | undefined;
}) {
  "use no memo";
  const { filters, setFilters, setSearchFilter } = useQuerySearch(
    "/(dashboard)/_dashboardLayout/notifications"
  );
  const [inputValue, setInputValue] = useState<string>(search ?? "");

  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.notification.list.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        searchFields,
        order: filters.order,
        orderField: filters.orderField,
        filter: {
          category: filters.category,
          level: filters.level,
        },
      },
    })
  );

  const handleCategoryChange = useCallback(
    (category: NotificationCategoryEnumType | null) => {
      setFilters({
        category,
      });
    },
    [setFilters]
  );

  const { mutate: markAsRead, isPending } = useNotificationMarkAsRead();

  const unreadCount = useMemo(() => {
    return data?.data?.data.filter((n) => !n.isRead).length;
  }, [data?.data?.data]);

  const handleMarkAllAsRead = useCallback(() => {
    markAsRead({
      ids: data?.data?.data.filter((n) => !n.isRead).map((n) => n.id) ?? [],
    });
  }, [markAsRead, data?.data?.data]);

  const globalSearch = useDebouncedCallback(
    (searchValue: string | null) => setSearchFilter(searchValue),
    500
  );

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    globalSearch(value);
    setInputValue(value);
  };

  return (
    <div className="flex flex-col gap-4 mx-auto max-w-3xl w-full">
      <div className="flex flex-wrap items-center justify-between">
        <Input
          name="search"
          placeholder="Search...."
          className="w-37 lg:w-62"
          value={inputValue}
          onChange={handleOnChange}
        />
        <Button
          variant="secondary"
          onClick={handleMarkAllAsRead}
          disabled={isPending || (unreadCount ?? 0) === 0}
          aria-disabled={isPending || (unreadCount ?? 0) === 0}
        >
          <CheckCheck />
          <span>Mark all read</span>
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          variant={filters.category === null ? "default" : "outline"}
          onClick={() => handleCategoryChange(null)}
        >
          All
        </Button>
        {NotificationCategoryEnumSchema.options.map((category) => (
          <Button
            key={category}
            variant={filters.category === category ? "default" : "outline"}
            onClick={() => handleCategoryChange(category)}
          >
            {formatEnumValue(category)}
          </Button>
        ))}
      </div>
      <QueryStateBoundary
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={data?.data}
        isEmpty={(d) => d.data.length === 0}
        emptyFallback={
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleQuestionMark />
              </EmptyMedia>
              <EmptyTitle>No data</EmptyTitle>
              <EmptyDescription>No Notification found</EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      >
        {({ data: notificationData, meta }) => (
          <>
            <div className="flex flex-col gap-3 ">
              {notificationData.map((notification) => (
                <div
                  className="bg-card rounded-md border overflow-hidden shadow"
                  key={notification.id}
                >
                  <NotificationItem
                    notification={notification}
                    className="px-3 py-3"
                  />
                </div>
              ))}
            </div>
            <MetaPagination
              meta={meta}
              onPageChange={(page) => setFilters({ page })}
            />
          </>
        )}
      </QueryStateBoundary>
    </div>
  );
}

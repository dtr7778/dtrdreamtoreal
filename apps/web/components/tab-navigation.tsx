"use client";

import { useCallback } from "react";

import { parseAsString, useQueryState } from "nuqs";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { cn } from "@workspace/ui/lib/utils";

interface TabNavigationProps extends React.ComponentProps<typeof Tabs> {
  paramName?: string;
}

export function TabNavigation({
  defaultValue,
  paramName = "tab",
  orientation = "horizontal",
  ...props
}: TabNavigationProps) {
  const [activeTab, setActiveTab] = useQueryState(
    paramName,
    parseAsString.withDefault(defaultValue || "").withOptions({
      clearOnDefault: false,
      shallow: true,
      history: "replace",
    })
  );

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
    },
    [setActiveTab]
  );

  return (
    <Tabs
      value={activeTab}
      orientation={orientation}
      onValueChange={handleTabChange}
      {...props}
    />
  );
}

export function TabNavigationList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsList>) {
  return (
    <div
      data-variant={variant}
      className="group-data-horizontal/tabs:data-[variant=line]:border-b group-data-vertical/tabs:data-[variant=line]:border-r group-data-horizontal/tabs:overflow-x-auto group-data-horizontal/tabs:overflow-y-hidden"
    >
      <TabsList
        variant={variant}
        className={cn("data-[variant=line]:p-0", className)}
        {...props}
      />
    </div>
  );
}

export function TabNavigationTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      className={cn(
        "text-sm  group-data-[variant=line]/tabs-list:data-active:bg-muted! group-data-[variant=line]/tabs-list:after:bottom-0 group-data-horizontal/tabs:group-data-[variant=line]/tabs-list:rounded-b-none group-data-vertical/tabs:group-data-[variant=line]/tabs-list:rounded-r-none group-data-vertical/tabs:group-data-[variant=line]/tabs-list:after:right-0! cursor-pointer",
        className
      )}
      {...props}
    />
  );
}

export function TabNavigationContent({
  ...props
}: React.ComponentProps<typeof TabsContent>) {
  return <TabsContent {...props} />;
}

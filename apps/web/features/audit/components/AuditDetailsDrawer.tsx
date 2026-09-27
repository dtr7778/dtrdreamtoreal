"use client";

import { useState } from "react";

import { ExternalLink } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { useAuditDetails } from "../api/audit.api.hook";
import { isAuditActive } from "../audit.constants";
import { AuditCwvHistory } from "./AuditCwvHistory";
import { AuditProgress } from "./AuditProgress";
import { AuditResults } from "./AuditResults";
import { AuditStatusBadge } from "./AuditStatusBadge";

interface AuditDetailsDrawerProps {
  auditId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditDetailsDrawer({
  auditId,
  open,
  onOpenChange,
}: AuditDetailsDrawerProps) {
  const [tab, setTab] = useState("results");

  const { data, isLoading, isError } = useAuditDetails(auditId, {
    enabled: open && Boolean(auditId),
    poll: true,
  });

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent className="data-[swipe-axis=x]:sm:[--drawer-content-width:36rem]">
        <QueryStateBoundary
          data={data?.data}
          isLoading={isLoading}
          isError={isError}
          isEmpty={() => false}
          loadingFallback={
            <DrawerHeader>
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </DrawerHeader>
          }
        >
          {(data) => (
            <>
              <DrawerHeader className="pb-2">
                <div className="space-y-2 text-left">
                  <div className="flex items-start justify-between gap-3">
                    <DrawerTitle className="text-base">{data.name}</DrawerTitle>
                    <AuditStatusBadge status={data.status} />
                  </div>
                  <a
                    href={data.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline"
                  >
                    <span className="max-w-80 truncate">{data.url}</span>
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                  {data.description && (
                    <DrawerDescription>{data.description}</DrawerDescription>
                  )}
                </div>
              </DrawerHeader>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4">
                {isAuditActive(data.status) && (
                  <AuditProgress
                    completed={data.completedItems}
                    total={data.totalItems}
                  />
                )}

                <Tabs value={tab} onValueChange={setTab}>
                  <TabsList>
                    <TabsTrigger value="results">Results</TabsTrigger>
                    <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
                  </TabsList>
                  <TabsContent value="results">
                    <AuditResults auditId={data.id} />
                  </TabsContent>
                  <TabsContent value="vitals">
                    <AuditCwvHistory auditId={data.id} />
                  </TabsContent>
                </Tabs>
              </div>
              <DrawerFooter className="pt-2">
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={
                    <a
                      href={`/audit/${data.id}`}
                      target="_blank"
                      rel="noreferrer noopener"
                    />
                  }
                >
                  <ExternalLink />
                  <span>Open public report</span>
                </Button>
                <DrawerClose render={<Button variant="secondary" />}>
                  Close
                </DrawerClose>
              </DrawerFooter>
            </>
          )}
        </QueryStateBoundary>
      </DrawerContent>
    </Drawer>
  );
}

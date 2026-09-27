"use client";

import { useState } from "react";

import {
  Check,
  Copy,
  ExternalLink,
  Gauge,
  Image as ImageIcon,
  Link2,
  Terminal,
  User2,
} from "lucide-react";
import toast from "react-hot-toast";

import type { ContractsType } from "@workspace/contract";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { FormatDateCell } from "@/components/format-date/FormatDateCell";

import { isAuditActive } from "../audit.constants";
import { AuditProgress } from "./AuditProgress";
import { AuditProgressDialog } from "./AuditProgressDialog";
import { AuditRowActions } from "./AuditRowActions";
import { AuditStatusBadge } from "./AuditStatusBadge";

interface AuditCardProps {
  audit: ContractsType["siteAudit"]["list"]["output"]["data"]["data"][number];
}

export function AuditCard({ audit }: AuditCardProps) {
  const [openProgress, setOpenProgress] = useState(false);
  const [copied, setCopied] = useState(false);

  const active = isAuditActive(audit.status);
  const publicPath = `/audit/${audit.id}`;

  const hostname = (() => {
    try {
      return new URL(audit.url).hostname;
    } catch {
      return audit.url;
    }
  })();

  const copyPublicLink = async () => {
    try {
      const absoluteUrl = new URL(publicPath, window.location.origin).toString();
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      toast.success("Public report link copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the link");
    }
  };

  return (
    <Card className="gap-4">
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h3 className="truncate text-sm font-semibold text-foreground">
              {audit.name}
            </h3>
            <a
              href={audit.url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              <span className="max-w-60 truncate">{hostname}</span>
              <ExternalLink className="size-3 shrink-0" />
            </a>
          </div>
          <AuditStatusBadge status={audit.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <AuditProgress
          completed={audit.completedItems}
          total={audit.totalItems}
        />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Gauge className="size-3.5" />
            <span className="font-medium text-green-600 dark:text-green-400">
              {audit.passedItems} passed
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-destructive">
              {audit.failedItems} failed
            </span>
          </span>
          {audit.triggeredByUser && (
            <span className="inline-flex items-center gap-1.5">
              <User2 className="size-3.5" />
              {audit.triggeredByUser.name}
            </span>
          )}
          <FormatDateCell
            value={audit.createdAt}
            format="dd MMM, yyyy hh:mm aa"
          />
        </div>

        <div className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-2.5 py-1.5">
          <Link2 className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate font-mono text-[0.7rem] text-muted-foreground">
            {publicPath}
          </span>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={copyPublicLink}
                  aria-label="Copy public report link"
                />
              }
            >
              {copied ? <Check /> : <Copy />}
            </TooltipTrigger>
            <TooltipContent>
              <p>{copied ? "Copied" : "Copy public link"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-2 border-t border-border/60 pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpenProgress(true)}
          >
            <Terminal />
            <span>{active ? "Live logs" : "View logs"}</span>
          </Button>
          {audit.reportImage && (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <a
                  href={audit.reportImage.url}
                  target="_blank"
                  rel="noreferrer noopener"
                />
              }
            >
              <ImageIcon />
              <span>Report image</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <a href={publicPath} target="_blank" rel="noreferrer noopener" />
            }
          >
            <ExternalLink />
            <span>Public report</span>
          </Button>
          <div className="ms-auto">
            <AuditRowActions audit={audit} />
          </div>
        </div>
      </CardContent>

      <AuditProgressDialog
        auditId={audit.id}
        auditName={audit.name}
        initialStatus={audit.status}
        open={openProgress}
        onOpenChange={setOpenProgress}
      />
    </Card>
  );
}

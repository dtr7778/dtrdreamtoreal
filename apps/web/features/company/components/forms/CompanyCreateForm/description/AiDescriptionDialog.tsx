"use client";

import { ArrowRight, Sparkles, TriangleAlert } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Dialog,
  DialogDescription,
  DialogResponsiveBody,
  DialogResponsiveContent,
  DialogStickyFooter,
  DialogStickyHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Spinner } from "@workspace/ui/components/spinner";

import { AiUsageType } from "@/features/company/company.schema";

import { useCompanyDescriptionContext } from "../contexts/CompanyDescriptionContext";
import { GenerateDescriptionButton } from "./GenerateDescriptionButton";

function formatCost(cost?: number): string {
  if (cost === undefined) return "cost n/a";
  return `$${cost.toFixed(6)}`;
}

export function AiDescriptionDialog() {
  "use no memo";

  const {
    isStreamingCompleted,
    aiDialogOpen,
    closeAiDialog,
    isStreaming,
    showStreamingAlert,
    setShowStreamingAlert,
    aiUsages,
  } = useCompanyDescriptionContext();

  const handleOpenChange = (
    nextOpen: boolean,
    eventDetails: { cancel: () => void }
  ) => {
    if (!nextOpen && isStreaming) {
      eventDetails.cancel();
      setShowStreamingAlert(true);
      return;
    }

    if (!nextOpen) {
      closeAiDialog();
    }
  };

  return (
    <>
      <Dialog
        open={aiDialogOpen || isStreaming}
        onOpenChange={handleOpenChange}
      >
        <DialogResponsiveContent>
          <DialogStickyHeader>
            <div className="flex items-center gap-2">
              <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Sparkles className="size-3.5" />
              </span>
              <DialogTitle>Generate company description</DialogTitle>
            </div>
            <DialogDescription>
              AI can draft a description from your briefing context. Review the
              suggestion, regenerate it, or skip and write it manually.
            </DialogDescription>
          </DialogStickyHeader>

          <DialogResponsiveBody className="flex flex-col gap-4">
            <DescriptionPreview />
            <GenerateDescriptionButton />
            <DescriptionUsage usages={aiUsages} />
          </DialogResponsiveBody>

          <DialogStickyFooter>
            <p className="me-auto hidden text-xs text-muted-foreground sm:block">
              {isStreamingCompleted
                ? "This draft will be added to your form."
                : "This step is optional — you can skip it."}
            </p>
            <Button
              type="button"
              variant={isStreamingCompleted ? "default" : "outline"}
              disabled={isStreaming}
              onClick={closeAiDialog}
            >
              {isStreamingCompleted ? "Continue" : "Skip"}
              {isStreamingCompleted && <ArrowRight className="size-3.5" />}
            </Button>
          </DialogStickyFooter>
        </DialogResponsiveContent>
      </Dialog>

      <AlertDialog
        open={showStreamingAlert}
        onOpenChange={setShowStreamingAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <TriangleAlert />
            </AlertDialogMedia>
            <AlertDialogTitle>Description is still generating</AlertDialogTitle>
            <AlertDialogDescription>
              The AI is still streaming the description. Stop the generation or
              wait for it to finish before closing this dialog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Keep generating</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function DescriptionPreview() {
  "use no memo";

  const { aiPreview, isStreaming, isStreamingCompleted } =
    useCompanyDescriptionContext();

  if (!aiPreview && !isStreaming) {
    return (
      <Empty className="border bg-muted/20 py-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Sparkles />
          </EmptyMedia>
          <EmptyTitle>No description yet</EmptyTitle>
          <EmptyDescription>
            Generate a draft from your briefing, or skip and write it yourself.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (isStreaming && !aiPreview) {
    return (
      <Card size="sm" className="gap-3 border bg-muted/20 ring-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="size-3.5" />
            AI suggestion
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Spinner size={10} />
              Generating
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card size="sm" className="gap-3 border bg-muted/20 ring-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-primary" />
          AI suggestion
        </CardTitle>
        <CardAction>
          {isStreaming ? (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Spinner size={10} />
              Generating
            </Badge>
          ) : isStreamingCompleted ? (
            <Badge variant="secondary">Ready to use</Badge>
          ) : null}
        </CardAction>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-48">
          <p
            className="whitespace-pre-wrap pe-3 text-sm leading-relaxed text-foreground/90"
            aria-live="polite"
            aria-busy={isStreaming}
          >
            {aiPreview}
            {isStreaming && (
              <span
                aria-hidden
                className="ms-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse rounded-sm bg-primary motion-reduce:animate-none"
              />
            )}
          </p>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function DescriptionUsage({ usages }: { usages: AiUsageType[] }) {
  if (usages.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-dashed bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
      {usages.map((usage, idx) => (
        <span
          key={`usage-${idx}`}
          className="inline-flex items-center gap-1.5"
        >
          <span className="font-mono text-foreground/80">{usage.model}</span>
          <span aria-hidden className="text-border">
            ·
          </span>
          {usage.totalTokens.toLocaleString()} tokens
          <span aria-hidden className="text-border">
            ·
          </span>
          {formatCost(usage.cost)}
          <span aria-hidden className="text-border">
            ·
          </span>
          {(usage.latencyMs / 1000).toFixed(1)}s
        </span>
      ))}
    </div>
  );
}

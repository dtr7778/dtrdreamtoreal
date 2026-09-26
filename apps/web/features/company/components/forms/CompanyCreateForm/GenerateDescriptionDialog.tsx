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
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogDescription,
  DialogResponsiveBody,
  DialogResponsiveContent,
  DialogStickyFooter,
  DialogStickyHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";

import { AiDescriptionPanel } from "@/features/company/components/ai-description/AiDescriptionPanel";

import { useCompanyDescriptionContext } from "./contexts/CompanyDescriptionContext";

export function GenerateDescriptionDialog() {
  "use no memo";

  const {
    isStreamingCompleted,
    aiDialogOpen,
    closeAiDialog,
    isStreaming,
    aiPreview,
    startGenerating,
    stopGenerating,
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
            <AiDescriptionPanel
              preview={aiPreview}
              isStreaming={isStreaming}
              isStreamingCompleted={isStreamingCompleted}
              usages={aiUsages}
              onGenerate={startGenerating}
              onStop={stopGenerating}
            />
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

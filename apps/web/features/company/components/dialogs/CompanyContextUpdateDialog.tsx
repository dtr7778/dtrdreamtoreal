"use client";

import { useEffect, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCcw, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Button } from "@workspace/ui/components/button";
import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogResponsiveBody,
  DialogResponsiveContent,
  DialogStickyFooter,
  DialogStickyHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { FieldDescription, FieldGroup } from "@workspace/ui/components/field";

import { AiUsageType } from "@/features/company/company.schema";
import { AiDescriptionPanel } from "@/features/company/components/ai-description/AiDescriptionPanel";
import { useDescriptionGenerator } from "@/features/company/hooks/use-description-generator";

import { companyCreateSchema, CompanyCreateType } from "../../company.schema";
import { contextSections } from "../forms/CompanyCreateForm/data/context-questions";
import { ContextQuestionField } from "../forms/CompanyCreateForm/fields/ContextQuestionField";

const companyContextUpdateFormSchema = z.object({
  context: companyCreateSchema.shape.context,
  description: companyCreateSchema.shape.description,
});

export type CompanyContextUpdateFormType = z.infer<
  typeof companyContextUpdateFormSchema
>;

interface CompanyContextUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
  companyIndustry?: string | null;
  companyWebsite?: string | null;
  defaultValues: CompanyCreateType["context"];
  defaultDescription?: string | null;
  onSubmit: (values: CompanyContextUpdateFormType) => void;
  isPending?: boolean;
}

export function CompanyContextUpdateDialog({
  open,
  onOpenChange,
  companyId,
  companyName,
  companyIndustry,
  companyWebsite,
  defaultValues,
  defaultDescription,
  onSubmit,
  isPending = false,
}: CompanyContextUpdateDialogProps) {
  "use no memo";
  const form = useForm<CompanyContextUpdateFormType>({
    resolver: zodResolver(companyContextUpdateFormSchema),
    defaultValues: {
      context: defaultValues,
      description: defaultDescription ?? "",
    },
  });

  const [aiUsages, setAiUsages] = useState<AiUsageType[]>([]);

  const formId = "company_context_update_form";

  const defaultValuesRef = useRef(defaultValues);
  const descriptionRef = useRef(defaultDescription ?? "");

  useEffect(() => {
    defaultValuesRef.current = defaultValues;
    descriptionRef.current = defaultDescription ?? "";
  }, [defaultValues, defaultDescription]);

  const {
    isStreaming,
    aiPreview,
    isStreamingCompleted,
    startGenerating,
    stopGenerating,
    resetDescription,
  } = useDescriptionGenerator({
    getInput: () => ({
      companyId,
      name: companyName,
      industry: companyIndustry ?? undefined,
      website: companyWebsite ?? undefined,
      context: form.getValues("context"),
    }),
    onDescription: (description) => {
      form.setValue("description", description, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    onUsage: (usage) => {
      if (!usage) {
        setAiUsages([]);
        return;
      }
      setAiUsages((prev) =>
        prev.some((item) => item.id === usage.id) ? prev : [...prev, usage]
      );
    },
    storageKeys: {
      preview: "company-context-ai-preview",
      completed: "company-context-ai-completed",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        context: defaultValuesRef.current,
        description: descriptionRef.current,
      });
      resetDescription();
    }
  }, [open, form, resetDescription]);

  const isDirty = form.formState.isDirty;

  const handleReset = () => {
    form.reset({
      context: defaultValuesRef.current,
      description: descriptionRef.current,
    });
    resetDescription();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogResponsiveContent className="w-full sm:max-w-2xl">
        <DialogStickyHeader>
          <DialogTitle>Update Briefing Context</DialogTitle>
          <DialogDescription>
            Edit the briefing answers used to understand this company. All
            fields are optional.
          </DialogDescription>
        </DialogStickyHeader>
        <DialogResponsiveBody>
          <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
            <FieldDescription className="mb-4">
              Expand a section and fill in what is known.
            </FieldDescription>
            <Accordion defaultValue={[contextSections[0]?.name ?? ""]}>
              {contextSections.map((section) => (
                <AccordionItem key={section.name} value={section.name}>
                  <AccordionTrigger>
                    <span className="flex flex-col text-start">
                      <span className="font-medium text-sm text-foreground">
                        {section.title}
                      </span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {section.description}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <FieldGroup>
                      {section.questions.map((question) => (
                        <ContextQuestionField
                          key={question.name}
                          question={question}
                          control={form.control}
                          disabled={isPending}
                        />
                      ))}
                    </FieldGroup>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  AI Description
                </span>
              </div>
              <AiDescriptionPanel
                preview={aiPreview}
                isStreaming={isStreaming}
                isStreamingCompleted={isStreamingCompleted}
                usages={aiUsages}
                onGenerate={startGenerating}
                onStop={stopGenerating}
              />
            </div>
          </form>
        </DialogResponsiveBody>
        <DialogStickyFooter>
          <p className="me-auto hidden text-xs text-muted-foreground sm:block">
            {isDirty
              ? "Your changes will be saved."
              : "Modify a field to enable saving."}
          </p>
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={!isDirty || isPending}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <ButtonSpinner
            form={formId}
            isLoading={isPending}
            type="submit"
            variant={isDirty ? "default" : "outline"}
            disabled={!isDirty || isStreaming}
          >
            Save
          </ButtonSpinner>
        </DialogStickyFooter>
      </DialogResponsiveContent>
    </Dialog>
  );
}

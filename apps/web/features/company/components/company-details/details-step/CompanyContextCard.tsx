"use client";

import { FileText, Pen } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Separator } from "@workspace/ui/components/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import {
  ContextQuestion,
  contextSections,
} from "@/features/company/components/forms/CompanyCreateForm/data/context-questions";

type CompanyContext = Record<string, string | string[]>;

type ResolvedQuestion = {
  question: ContextQuestion;
  value: string | string[];
};

function isEmptyValue(value: string | string[] | undefined): boolean {
  if (value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  return value.trim().length === 0;
}

function resolveOptionLabel(question: ContextQuestion, value: string): string {
  return (
    question.options?.find((option) => option.value === value)?.label ?? value
  );
}

function buildSections(context: CompanyContext) {
  const knownNames = new Set(
    contextSections.flatMap((section) =>
      section.questions.map((question) => question.name)
    )
  );

  const sections = contextSections
    .map((section) => ({
      name: section.name,
      title: section.title,
      questions: section.questions
        .filter((question) => !isEmptyValue(context?.[question.name]))
        .map<ResolvedQuestion>((question) => ({
          question,
          value: context[question.name] as string | string[],
        })),
    }))
    .filter((section) => section.questions.length > 0);

  const extraQuestions = Object.entries(context)
    .filter(
      ([name, value]) => !knownNames.has(name) && !isEmptyValue(value as string)
    )
    .map<ResolvedQuestion>(([name, value]) => ({
      question: { name, label: name, type: "text" },
      value: value as string | string[],
    }));

  if (extraQuestions.length > 0) {
    sections.push({
      name: "additional",
      title: "Additional information",
      questions: extraQuestions,
    });
  }

  return sections;
}

export function CompanyContextCard({
  context,
  onEdit,
}: {
  context: CompanyContext;
  onEdit?: () => void;
}) {
  const sections = buildSections(context);
  const firstSection = sections[0]?.name;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="size-4 text-primary" />
          <h3 className="font-semibold text-foreground">Briefing Context</h3>
        </CardTitle>

        {onEdit && (
          <CardAction>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button size="icon-sm" variant="outline" onClick={onEdit} />
                }
              >
                <Pen />
              </TooltipTrigger>
              <TooltipContent>
                <p>Update</p>
              </TooltipContent>
            </Tooltip>
          </CardAction>
        )}
      </CardHeader>
      <Separator />
      <CardContent>
        {sections.length === 0 ? (
          <Empty className="border bg-muted/20 py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText />
              </EmptyMedia>
              <EmptyTitle>No briefing context yet</EmptyTitle>
              <EmptyDescription>
                Briefing answers captured during company creation will appear
                here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Accordion defaultValue={firstSection ? [firstSection] : []}>
            {sections.map((section) => (
              <AccordionItem key={section.name} value={section.name}>
                <AccordionTrigger>
                  <span className="flex items-center gap-2 text-start">
                    <span className="text-sm font-medium text-foreground">
                      {section.title}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-xs text-muted-foreground"
                    >
                      {`${section.questions.length} ${
                        section.questions.length === 1 ? "field" : "fields"
                      }`}
                    </Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <dl className="grid gap-3">
                    {section.questions.map(({ question, value }) => (
                      <div
                        key={question.name}
                        className="grid gap-1 rounded-lg border border-border/60 bg-muted/30 p-3"
                      >
                        <dt className="text-xs font-medium text-muted-foreground">
                          {`Q#. ${question.label}`}
                        </dt>
                        <dd className="text-sm text-foreground">
                          {Array.isArray(value) ? (
                            <div className="flex flex-wrap gap-1.5">
                              {value.map((item) => (
                                <Badge
                                  key={item}
                                  variant="outline"
                                  className="font-medium"
                                >
                                  {resolveOptionLabel(question, item)}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap leading-relaxed">
                              {resolveOptionLabel(question, value)}
                            </p>
                          )}
                        </dd>
                        <dd className="text-muted-foreground">
                          {`Info: ${question.description}`}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}

import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Gauge,
  Lock,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";

import { formatDateWithTimezone } from "@workspace/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Progress } from "@workspace/ui/components/progress";
import { cn } from "@workspace/ui/lib/utils";

import { env } from "@/lib/env";

import { AuditDetailsContractType } from "../../api/audit.public.contract";
import { humanizeAuditSection } from "../../audit.constants";

interface PublicAuditReportProps {
  report: AuditDetailsContractType["output"]["data"];
  ctaHref: string;
}

function scoreTone(score: number) {
  if (score >= 80) {
    return {
      text: "text-green-600 dark:text-green-400",
      ring: "stroke-green-500",
      label: "Healthy",
    };
  }
  if (score >= 50) {
    return {
      text: "text-orange-600 dark:text-orange-400",
      ring: "stroke-orange-500",
      label: "Needs work",
    };
  }
  return {
    text: "text-destructive",
    ring: "stroke-destructive",
    label: "Critical",
  };
}

function ScoreDonut({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const tone = scoreTone(score);

  return (
    <div className="relative flex size-32 shrink-0 items-center justify-center">
      <svg viewBox="0 0 120 120" className="size-32 -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          className="stroke-muted"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-[stroke-dashoffset]", tone.ring)}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn("text-3xl font-bold tabular-nums", tone.text)}>
          {score}
        </span>
        <span className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
          Score
        </span>
      </div>
    </div>
  );
}

export function PublicAuditReport({ report, ctaHref }: PublicAuditReportProps) {
  const tone = scoreTone(report.score);
  const issueCount = report.summary.failed + report.summary.error;
  const passedWidth =
    report.summary.total > 0
      ? Math.round((report.summary.passed / report.summary.total) * 100)
      : 0;

  const stats = [
    {
      label: "Checks passed",
      value: report.summary.passed,
      icon: CheckCircle2,
      className: "text-green-600 dark:text-green-400",
    },
    {
      label: "Issues found",
      value: issueCount,
      icon: XCircle,
      className: "text-destructive",
    },
    {
      label: "Warnings",
      value: report.summary.warning + report.summary.needsReview,
      icon: AlertTriangle,
      className: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Total checks",
      value: report.summary.total,
      icon: Gauge,
      className: "text-blue-600 dark:text-blue-400",
    },
  ];

  const valueProps = [
    "The full item-by-item checklist with evidence and screenshots",
    "A prioritized, developer-ready fix plan for every issue",
    "Core Web Vitals deep dives for mobile and desktop",
    "A senior expert walkthrough of the results",
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ShieldCheck className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-foreground">
            Website Audit Report
          </p>
          <p className="text-xs text-muted-foreground">
            Prepared for {report.name}
          </p>
        </div>
      </header>

      <Card className="overflow-hidden border-border/60 bg-linear-to-br from-primary/5 via-background to-background">
        <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:p-8">
          <ScoreDonut score={report.score} />
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Badge
                variant={
                  report.status === "failed" || report.status === "partial"
                    ? "destructive"
                    : report.status === "completed"
                      ? "secondary"
                      : "outline"
                }
                className="capitalize"
              >
                {report.status}
              </Badge>
              <Badge variant="outline" className={tone.text}>
                {tone.label}
              </Badge>
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {report.score >= 80
                ? "Your site is in good shape"
                : report.score >= 50
                  ? "Your site has room to improve"
                  : "Your site has critical issues"}
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              We audited{" "}
              <span className="font-medium text-foreground">{report.url}</span>{" "}
              across{" "}
              <span className="font-medium text-foreground">
                {report.summary.total}
              </span>{" "}
              automated checks and found{" "}
              <span className="font-medium text-destructive">
                {issueCount} issues
              </span>{" "}
              that could be costing you traffic and revenue.
            </p>
            {report.completedAt && (
              <p className="text-xs text-muted-foreground">
                Completed{" "}
                {formatDateWithTimezone(
                  report.completedAt,
                  "dd MMM, yyyy hh:mm aa"
                )}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="py-0">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <stat.icon className={cn("size-4", stat.className)} />
              </div>
              <div className="min-w-0">
                <div className="text-lg font-semibold tabular-nums">
                  {stat.value}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Results by area</CardTitle>
            <CardDescription>
              How your site performed across each part of the audit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.sections.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No results available yet.
              </p>
            ) : (
              report.sections.map((section) => {
                const percent =
                  section.total > 0
                    ? Math.round((section.passed / section.total) * 100)
                    : 0;
                return (
                  <div key={section.section} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">
                        {humanizeAuditSection(section.section)}
                      </span>
                      <span className="text-muted-foreground tabular-nums">
                        {section.passed}/{section.total} passed
                      </span>
                    </div>
                    <Progress
                      value={percent}
                      aria-label={`${section.section} score`}
                    />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top issues we found</CardTitle>
            <CardDescription>
              Full details, evidence, and fixes are in the complete report.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.topIssues.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No blocking issues detected. Nice work!
              </p>
            ) : (
              report.topIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3"
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground">
                      {issue.title}
                    </p>
                    <p className="text-[0.7rem] text-muted-foreground">
                      {humanizeAuditSection(issue.section)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
              <Lock className="size-3.5" />
              Detailed remediation steps are hidden in this preview.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-primary/20 bg-linear-to-br from-primary/10 via-background to-background">
        <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" />
              Unlock the complete report
            </div>
            <h2 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Fix these {issueCount} issues before your competitors do
            </h2>
            <p className="text-sm text-muted-foreground">
              You are seeing a limited preview. Get the full audit plus an
              actionable plan from our team.
            </p>
            <ul className="space-y-2">
              {valueProps.map((prop) => (
                <li
                  key={prop}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" />
                  <span>{prop}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-background/80 p-6 text-center backdrop-blur">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Talk to an expert
              </p>
              <p className="text-xs text-muted-foreground">
                We will walk you through the findings and how to fix them.
              </p>
            </div>
            <Button
              className="w-full"
              nativeButton={false}
              render={<a href={ctaHref} />}
            >
              <span>Get the full report</span>
              <ArrowUpRight />
            </Button>
            <a
              href={`mailto:${env.SUPPORT_MAIL}`}
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              {`or email ${env.SUPPORT_MAIL}`}
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        <span>
          Preview shows {report.summary.completed}/{report.summary.total} checks
          ({passedWidth}% passing).
        </span>
        <span>Full report available on request</span>
      </div>
    </div>
  );
}

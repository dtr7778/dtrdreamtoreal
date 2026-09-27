import { asc, eq } from "drizzle-orm";

import { AuditItemTable, SiteAuditTable } from "@workspace/drizzle/schemas";
import { apiResponse } from "@workspace/lib/utils";

import { API_MESSAGES } from "@/constants/apiMessage";

import { auditImpl } from "./audit.procedure";

export const auditDetailsProcedure = auditImpl.public.details.handler(
  async ({ context, input, errors }) => {
    const [site] = await context.db
      .select({
        id: SiteAuditTable.id,
        name: SiteAuditTable.name,
        url: SiteAuditTable.url,
        status: SiteAuditTable.status,
        startedAt: SiteAuditTable.startedAt,
        completedAt: SiteAuditTable.completedAt,
      })
      .from(SiteAuditTable)
      .where(eq(SiteAuditTable.id, input.id))
      .limit(1);

    if (!site) throw errors.NOT_FOUND();

    const items = await context.db
      .select({
        id: AuditItemTable.id,
        title: AuditItemTable.title,
        section: AuditItemTable.section,
        url: AuditItemTable.url,
        status: AuditItemTable.status,
      })
      .from(AuditItemTable)
      .where(eq(AuditItemTable.siteAuditId, site.id))
      .orderBy(asc(AuditItemTable.section));

    const summary = {
      total: items.length,
      completed: 0,
      passed: 0,
      failed: 0,
      warning: 0,
      error: 0,
      needsReview: 0,
      skipped: 0,
      pending: 0,
    };

    const sectionMap = new Map<
      string,
      { section: string; total: number; passed: number; failed: number }
    >();
    const topIssues: Array<{
      id: string;
      title: string;
      section: string;
      url: string | null;
    }> = [];

    for (const item of items) {
      switch (item.status) {
        case "passed":
          summary.passed += 1;
          break;
        case "failed":
          summary.failed += 1;
          break;
        case "warning":
          summary.warning += 1;
          break;
        case "needs_review":
          summary.needsReview += 1;
          break;
        case "error":
          summary.error += 1;
          break;
        case "skipped":
          summary.skipped += 1;
          break;
        default:
          summary.pending += 1;
      }

      if (item.status !== "pending") summary.completed += 1;

      const section = sectionMap.get(item.section) ?? {
        section: item.section,
        total: 0,
        passed: 0,
        failed: 0,
      };
      section.total += 1;
      if (item.status === "passed") section.passed += 1;
      if (item.status === "failed" || item.status === "error")
        section.failed += 1;
      sectionMap.set(item.section, section);

      if (
        (item.status === "failed" || item.status === "error") &&
        topIssues.length < 8
      ) {
        topIssues.push({
          id: item.id,
          title: item.title,
          section: item.section,
          url: item.url,
        });
      }
    }

    const score =
      summary.total > 0
        ? Math.round((summary.passed / summary.total) * 100)
        : 0;

    return apiResponse(API_MESSAGES.AUDIT.GET_DETAILS, {
      ...site,
      score,
      summary,
      sections: [...sectionMap.values()],
      topIssues,
    });
  }
);

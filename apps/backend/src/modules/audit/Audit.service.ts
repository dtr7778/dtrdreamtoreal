import { and, asc, eq, sql } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { inject } from "inversify";

import {
  AuditItemTable,
  CwvSnapshotTable,
  InsertAuditItem,
  InsertSiteAudit,
  type SelectAuditItem,
  type SelectSiteAudit,
  SiteAuditDataModel,
  SiteAuditTable,
  UpdateSiteAudit,
} from "@workspace/drizzle/schemas";
import type { DatabaseType } from "@workspace/drizzle/types";
import type { AuditItemStatusEnumType } from "@workspace/drizzle/zod-db-enums";
import { ApiError } from "@workspace/lib/server";
import { formatError } from "@workspace/lib/utils";
import type { ExtendedRedis } from "@workspace/redis/client/ioRedis";

import { API_MESSAGE } from "@/constant";
import { CONTAINER_TYPES } from "@/container/container-types";

import { type RunCheckJobPayload } from "./audit.queue";
import { type IAuditLogService } from "./AuditLog.service";
import { type AuditQueueService } from "./AuditQueue.service";
import { type IAuditReportImageService } from "./AuditReport.service";
import {
  CHECKLIST,
  getChecklistItem,
  getManualItems,
} from "./checklist/registry";
import type {
  CheckContext,
  ChecklistItem,
  CheckResult,
  CwvSnapshotInput,
} from "./checklist/types";
import { CruxClient } from "./clients/crux.client";
import { PsiClient } from "./clients/psi.client";
import { AUDIT_DEFAULTS, AUDIT_REDIS_KEYS } from "./constants";
import { crawlSite } from "./lib/crawl";
import { httpFetch } from "./lib/http";
import { parseRobotsTxt, type RobotsData } from "./lib/robots";
import { fetchSitemapUrls, type SitemapResult } from "./lib/sitemap";

export interface AuditServiceDependencies {
  db: DatabaseType;
  redis: ExtendedRedis;
  queue: AuditQueueService;
  psi: PsiClient;
  crux: CruxClient;
}

export interface AuditResultsSummary {
  total: number;
  completed: number;
  passed: number;
  failed: number;
  warning: number;
  needsReview: number;
  error: number;
  skipped: number;
  pending: number;
}

export interface AuditSectionResult {
  section: string;
  total: number;
  passed: number;
  failed: number;
  items: SelectAuditItem[];
}

export interface IAuditService {
  createSiteAudit(
    companyId: string,
    name: string,
    url: string,
    description?: string | undefined
  ): Promise<SelectSiteAudit>;
  orchestrate(siteAuditId: string): Promise<number>;
  runCheck(payload: RunCheckJobPayload, jobId?: string): Promise<CheckResult>;
  storeCwv(siteAuditId: string, snapshot: CwvSnapshotInput): Promise<void>;
  getResults(siteAuditId: string): Promise<{
    siteAudit: SelectSiteAudit;
    summary: AuditResultsSummary;
    sections: AuditSectionResult[];
  }>;
}

export class AuditService implements IAuditService {
  constructor(
    @inject(CONTAINER_TYPES.Drizzle) private readonly db: DatabaseType,
    @inject(CONTAINER_TYPES.Redis) private readonly redis: ExtendedRedis,
    @inject(CONTAINER_TYPES.AuditQueueService)
    private readonly auditQueue: AuditQueueService,
    @inject(CONTAINER_TYPES.AuditLogService)
    private readonly auditLog: IAuditLogService,
    @inject(CONTAINER_TYPES.AuditReportImageService)
    private readonly auditReportImage: IAuditReportImageService,
    @inject(CONTAINER_TYPES.PsiClient)
    private readonly psi: PsiClient,
    @inject(CONTAINER_TYPES.CruxClient)
    private readonly crux: CruxClient
  ) {}

  private async getSiteAuditOrThrow(
    siteId: string
  ): Promise<SiteAuditDataModel> {
    const [siteAuditData] = await this.db
      .select()
      .from(SiteAuditTable)
      .where(eq(SiteAuditTable.id, siteId))
      .limit(1);
    if (!siteAuditData) {
      throw new ApiError({
        statusCode: StatusCodes.NOT_FOUND,
        message: `Site not found: ${siteId}`,
      });
    }
    return siteAuditData;
  }

  public async createSiteAudit(
    companyId: string,
    name: string,
    url: string,
    description?: string | undefined
  ): Promise<SelectSiteAudit> {
    const [insertedSiteAudit] = await this.db
      .insert(SiteAuditTable)
      .values({
        status: "pending",
        companyId,
        name,
        url,
        description,
      } satisfies InsertSiteAudit)
      .returning();

    if (!insertedSiteAudit) {
      throw new ApiError({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: API_MESSAGE.AUDIT.NOT_CREATE,
      });
    }

    try {
      await this.auditQueue.enqueueOrchestrate(
        insertedSiteAudit.id,
        `orchestrate_${insertedSiteAudit.id}`
      );
    } catch (err) {
      const message = formatError(err);

      const [failedSiteAudit] = await this.db
        .update(SiteAuditTable)
        .set({ status: "failed", error: message } satisfies UpdateSiteAudit)
        .where(eq(SiteAuditTable.id, insertedSiteAudit.id))
        .returning();
      return failedSiteAudit ?? insertedSiteAudit;
    }

    return insertedSiteAudit;
  }

  public async orchestrate(siteAuditId: string): Promise<number> {
    const siteAudit = await this.getSiteAuditOrThrow(siteAuditId);

    await this.auditLog.publish(siteAudit.id, {
      type: "run_started",
      message: `Audit run started for ${siteAudit.url}`,
      data: { url: siteAudit.url },
    });

    await this.auditLog.publish(siteAudit.id, {
      type: "crawl_started",
      message: `Crawling ${siteAudit.url}`,
      data: { url: siteAudit.url },
    });

    const crawl = await crawlSite(siteAudit.url, {
      maxPages: AUDIT_DEFAULTS.crawlMaxPages,
      maxDepth: AUDIT_DEFAULTS.crawlMaxDepth,
    });

    await this.auditLog.publish(siteAudit.id, {
      type: "crawl_finished",
      message: `Crawl discovered ${crawl.pages.length} page(s)`,
      data: { pages: crawl.pages.length },
    });

    await this.redis.set(
      AUDIT_REDIS_KEYS.crawl(siteAudit.id),
      JSON.stringify(crawl),
      "EX",
      AUDIT_DEFAULTS.crawlCacheTtlSeconds
    );

    const manualItems = getManualItems();
    const tasks = this.buildTasks(
      siteAudit,
      crawl.pages.map((page) => page.url)
    );

    if (manualItems.length > 0) {
      await this.db.insert(AuditItemTable).values(
        manualItems.map(
          (item) =>
            ({
              checklistKey: item.key,
              section: item.section,
              title: item.title,
              status: "needs_review" as const,
              message: "Manual review required",
              url: siteAudit.url,
              siteAuditId: siteAudit.id,
            }) satisfies InsertAuditItem
        )
      );
    }

    const total = tasks.length + manualItems.length;

    await this.auditLog.publish(siteAudit.id, {
      type: "tasks_planned",
      message: `Planned ${total} check(s): ${tasks.length} automated, ${manualItems.length} manual`,
      data: {
        total,
        automated: tasks.length,
        manual: manualItems.length,
      },
    });

    await this.redis.set(
      AUDIT_REDIS_KEYS.total(siteAudit.id),
      String(total),
      "EX",
      AUDIT_DEFAULTS.runTotalTtlSeconds
    );
    await this.redis.set(
      AUDIT_REDIS_KEYS.progress(siteAudit.id),
      String(manualItems.length),
      "EX",
      AUDIT_DEFAULTS.runTotalTtlSeconds
    );

    await this.db
      .update(SiteAuditTable)
      .set({
        status: "running",
        startedAt: new Date(),
        totalItems: total,
        completedItems: manualItems.length,
        updatedAt: new Date(),
      })
      .where(eq(SiteAuditTable.id, siteAudit.id));

    let enqueued = 0;
    for (const task of tasks) {
      await this.auditQueue.enqueueRunCheck(
        {
          siteAuditId: siteAudit.id,
          checklistKey: task.checklistKey,
          url: task.url,
        },
        `check_${siteAudit.id}_${task.checklistKey}_${task.url}`
      );
      enqueued += 1;
    }

    if (total === manualItems.length) {
      await this.finalizeRun(siteAudit.id);
    }

    return enqueued;
  }

  private buildTasks(
    site: SiteAuditDataModel,
    pageUrls: string[]
  ): Array<{ checklistKey: string; url: string }> {
    const tasks: Array<{ checklistKey: string; url: string }> = [];
    const uniquePages = [
      site.url,
      ...pageUrls.filter((url) => url !== site.url),
    ];

    for (const item of CHECKLIST) {
      if (item.automation === "manual") continue;

      if (item.scope === "site") {
        tasks.push({ checklistKey: item.key, url: site.url });
        continue;
      }

      const limit = item.maxPages ?? AUDIT_DEFAULTS.maxPagesPerCheck;
      for (const pageUrl of uniquePages.slice(0, limit)) {
        tasks.push({ checklistKey: item.key, url: pageUrl });
      }
    }

    return tasks.slice(0, AUDIT_DEFAULTS.maxFanOutMessages);
  }

  public async runCheck(
    payload: RunCheckJobPayload,
    jobId?: string
  ): Promise<CheckResult> {
    const { siteAuditId, checklistKey, url } = payload;

    if (jobId) {
      const lockKey = AUDIT_REDIS_KEYS.idempotency(jobId);
      const acquired = await this.redis.set(
        lockKey,
        "1",
        "EX",
        AUDIT_DEFAULTS.idempotencyLockTtlSeconds,
        "NX"
      );
      if (acquired !== "OK") {
        return {
          status: "skipped",
          message: "Duplicate delivery ignored",
        };
      }
    }

    const item = getChecklistItem(checklistKey);
    if (!item || !item.checkFn) {
      throw new ApiError({
        statusCode: StatusCodes.NOT_FOUND,
        message: `Checklist item not found or not automatable: ${checklistKey}`,
      });
    }

    const site = await this.getSiteAuditOrThrow(siteAuditId);
    const context = this.buildContext(site, url, checklistKey);

    await this.auditLog.publish(siteAuditId, {
      type: "check_started",
      message: `Running "${item.title}"`,
      data: { checklistKey, url, title: item.title, section: item.section },
    });

    let result: CheckResult;
    const startedAt = Date.now();
    try {
      result = await item.checkFn(context);
    } catch (err) {
      result = {
        status: "error",
        message: err instanceof Error ? err.message : "Check failed",
      };
    }
    const durationMs = Date.now() - startedAt;

    await this.auditLog.publish(siteAuditId, {
      type: "check_finished",
      level:
        result.status === "failed" || result.status === "error"
          ? "error"
          : result.status === "warning" || result.status === "needs_review"
            ? "warn"
            : "info",
      message: `"${item.title}" ${result.status} (${durationMs}ms)`,
      data: {
        checklistKey,
        url,
        title: item.title,
        status: result.status,
        durationMs,
        message: result.message,
      },
    });

    await this.persistItem({
      siteAuditId,
      item,
      url,
      result,
      durationMs,
    });

    await this.incrementProgress(siteAuditId);

    return result;
  }

  private async persistItem(params: {
    siteAuditId: string;
    item: ChecklistItem;
    url: string;
    result: CheckResult;
    durationMs: number;
  }): Promise<void> {
    const { siteAuditId, item, url, result, durationMs } = params;

    const existing = await this.db
      .select({ id: AuditItemTable.id })
      .from(AuditItemTable)
      .where(
        and(
          eq(AuditItemTable.siteAuditId, siteAuditId),
          eq(AuditItemTable.checklistKey, item.key),
          eq(AuditItemTable.url, url)
        )
      )
      .limit(1);

    const values = {
      status: result.status as AuditItemStatusEnumType,
      message: result.message,
      evidence: result.evidence ?? null,
      durationMs,
      section: item.section,
      title: item.title,
    };

    const previous = existing[0];
    if (previous) {
      await this.db
        .update(AuditItemTable)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(AuditItemTable.id, previous.id));
      return;
    }

    await this.db.insert(AuditItemTable).values({
      siteAuditId,
      checklistKey: item.key,
      url,
      ...values,
    });
  }

  private async incrementProgress(siteAuditId: string): Promise<void> {
    const progressKey = AUDIT_REDIS_KEYS.progress(siteAuditId);
    const totalKey = AUDIT_REDIS_KEYS.total(siteAuditId);

    const [progress, totalRaw] = await Promise.all([
      this.redis.incr(progressKey),
      this.redis.get(totalKey),
    ]);

    const total = Number(totalRaw ?? 0);

    await this.auditLog.publish(siteAuditId, {
      type: "progress",
      message: `Progress ${progress}/${total}`,
      data: { completed: progress, total },
    });

    await this.db
      .update(SiteAuditTable)
      .set({ completedItems: progress, updatedAt: new Date() })
      .where(eq(SiteAuditTable.id, siteAuditId));

    if (total > 0 && progress >= total) {
      await this.finalizeRun(siteAuditId);
    }
  }

  private async finalizeRun(siteAuditId: string): Promise<void> {
    const finalizedKey = AUDIT_REDIS_KEYS.finalized(siteAuditId);
    const acquired = await this.redis.set(
      finalizedKey,
      "1",
      "EX",
      AUDIT_DEFAULTS.logStreamTtlSeconds,
      "NX"
    );
    if (acquired !== "OK") return;

    const counts = await this.db
      .select({
        status: AuditItemTable.status,
        count: sql<number>`count(*)::int`,
      })
      .from(AuditItemTable)
      .where(eq(AuditItemTable.siteAuditId, siteAuditId))
      .groupBy(AuditItemTable.status);

    const byStatus = new Map<string, number>();
    let total = 0;
    for (const row of counts) {
      byStatus.set(row.status, Number(row.count));
      total += Number(row.count);
    }

    const passed = byStatus.get("passed") ?? 0;
    const failed = byStatus.get("failed") ?? 0;
    const error = byStatus.get("error") ?? 0;

    await this.auditLog.publish(siteAuditId, {
      type: "run_completed",
      message: `Audit completed: ${passed} passed, ${failed + error} failed of ${total}`,
      data: {
        total,
        passed,
        failed: failed + error,
      },
    });

    await this.auditLog.persistRun(siteAuditId);

    await this.db
      .update(SiteAuditTable)
      .set({
        status: "completed",
        completedItems: total,
        passedItems: passed,
        failedItems: failed + error,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(SiteAuditTable.id, siteAuditId));

    try {
      await this.auditReportImage.generateReportImage(siteAuditId);
    } catch {
      // Swallowed intentionally; the audit is already marked completed.
    }
  }

  private buildContext(
    site: SiteAuditDataModel,
    url: string,
    checklistKey: string
  ): CheckContext {
    let robotsPromise: Promise<RobotsData | null> | null = null;
    let sitemapPromise: Promise<SitemapResult | null> | null = null;
    let crawlPromise: Promise<Awaited<ReturnType<typeof crawlSite>>> | null =
      null;

    const origin = new URL(site.url).origin;

    const getCrawl = (): Promise<Awaited<ReturnType<typeof crawlSite>>> => {
      crawlPromise ??= (async () => {
        const cached = await this.redis.get(AUDIT_REDIS_KEYS.crawl(site.id));
        if (cached) {
          return JSON.parse(cached) as Awaited<ReturnType<typeof crawlSite>>;
        }
        const fresh = await crawlSite(site.url, {
          maxPages: AUDIT_DEFAULTS.crawlMaxPages,
          maxDepth: AUDIT_DEFAULTS.crawlMaxDepth,
        });
        await this.redis.set(
          AUDIT_REDIS_KEYS.crawl(site.id),
          JSON.stringify(fresh),
          "EX",
          AUDIT_DEFAULTS.crawlCacheTtlSeconds
        );
        return fresh;
      })();
      return crawlPromise;
    };

    const getRobots = () => {
      if (!robotsPromise) {
        robotsPromise = (async () => {
          const response = await httpFetch(`${origin}/robots.txt`);
          if (!response.ok) return null;
          return parseRobotsTxt(response.body);
        })();
      }
      return robotsPromise;
    };

    const getSitemap = () => {
      if (!sitemapPromise) {
        sitemapPromise = (async () => {
          const robots = await getRobots();
          const declared = robots?.sitemaps[0];
          const candidates = [
            declared,
            `${origin}/sitemap.xml`,
            `${origin}/sitemap_index.xml`,
          ].filter((value): value is string => Boolean(value));

          for (const candidate of candidates) {
            const result = await fetchSitemapUrls(candidate);
            if (result.entries.length > 0) return result;
          }
          return null;
        })();
      }
      return sitemapPromise;
    };

    return {
      url,
      siteUrl: site.url,
      origin,
      checklistKey,
      fetchPage: (targetUrl: string) => httpFetch(targetUrl),
      getCrawl,
      getRobots,
      getSitemap,
      runPsi: (targetUrl, strategy) => this.psi.run(targetUrl, strategy),
      queryCrux: (targetUrl, formFactor) =>
        this.crux.queryRecord(targetUrl, formFactor),
      storeCwv: (snapshot: CwvSnapshotInput) =>
        this.storeCwv(site.id, snapshot),
    };
  }

  public async storeCwv(
    siteAuditId: string,
    snapshot: CwvSnapshotInput
  ): Promise<void> {
    await this.db.insert(CwvSnapshotTable).values({
      siteAuditId,
      url: snapshot.url,
      strategy: snapshot.strategy,
      source: snapshot.source,
      lcp: snapshot.lcp,
      inp: snapshot.inp,
      cls: snapshot.cls,
      ttfb: snapshot.ttfb,
      fcp: snapshot.fcp,
      performanceScore: snapshot.performanceScore,
      countryCode: snapshot.countryCode,
    });
  }

  public async getResults(siteAuditId: string): Promise<{
    siteAudit: SelectSiteAudit;
    summary: AuditResultsSummary;
    sections: AuditSectionResult[];
  }> {
    const siteAudit = await this.getSiteAuditOrThrow(siteAuditId);

    const items = await this.db
      .select()
      .from(AuditItemTable)
      .where(eq(AuditItemTable.siteAuditId, siteAudit.id))
      .orderBy(asc(AuditItemTable.section), asc(AuditItemTable.checklistKey));

    const summary: AuditResultsSummary = {
      total: items.length,
      completed: items.filter((item) => item.status !== "pending").length,
      passed: 0,
      failed: 0,
      warning: 0,
      needsReview: 0,
      error: 0,
      skipped: 0,
      pending: 0,
    };

    const sectionMap = new Map<string, AuditSectionResult>();

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

      const section = sectionMap.get(item.section) ?? {
        section: item.section,
        total: 0,
        passed: 0,
        failed: 0,
        items: [],
      };
      section.total += 1;
      if (item.status === "passed") section.passed += 1;
      if (item.status === "failed" || item.status === "error")
        section.failed += 1;
      section.items.push(item);
      sectionMap.set(item.section, section);
    }

    return { siteAudit, summary, sections: [...sectionMap.values()] };
  }
}

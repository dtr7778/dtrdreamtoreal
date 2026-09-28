import { and, eq, isNull, ne, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { inject, injectable } from "inversify";

import { RunCheckItemJobPayload } from "@workspace/contract/worker";
import {
  AuditItemTable,
  CwvSnapshotTable,
  InsertAuditItem,
  SiteAuditDataModel,
  SiteAuditTable,
} from "@workspace/drizzle/schemas";
import { type DatabaseType } from "@workspace/drizzle/types";
import { AuditItemStatusEnumType } from "@workspace/drizzle/zod-db-enums";
import { type ExtendedRedis } from "@workspace/redis/client/ioRedis";
import {
  AUDIT_LOG_DEFAULTS,
  type IAuditLogService,
} from "@workspace/server-core/services";

import { CONTAINER_TYPES } from "@/container/container-types";

import { AUDIT_DEFAULTS, AUDIT_REDIS_KEYS } from "./audit.constant";
import { type IAuditQueueService } from "./AuditQueue.service";
import { type IAuditReportQueueService } from "./AuditReportQueue.service";
import {
  CHECKLIST,
  getChecklistItem,
  getManualItems,
} from "./checklist/registry";
import {
  CheckContext,
  ChecklistItem,
  CheckResult,
  CwvSnapshotInput,
} from "./checklist/types";
import { type ICruxClient } from "./clients/crux.client";
import { type IPsiClient } from "./clients/psi.client";
import { crawlSite } from "./lib/crawl";
import { httpFetch } from "./lib/http";
import { parseRobotsTxt, RobotsData } from "./lib/robots";
import { fetchSitemapUrls, SitemapResult } from "./lib/sitemap";

export interface IAUditService {
  orchestrate(siteAuditId: string): Promise<number>;
  runCheck(payload: RunCheckItemJobPayload): Promise<CheckResult>;
  markCheckFailed(
    payload: RunCheckItemJobPayload,
    message: string
  ): Promise<void>;
  markRunFailed(siteAuditId: string, message: string): Promise<void>;
  storeCwv(siteAuditId: string, snapshot: CwvSnapshotInput): Promise<void>;
}

@injectable()
export class AuditService implements IAUditService {
  constructor(
    @inject(CONTAINER_TYPES.Drizzle) private readonly db: DatabaseType,
    @inject(CONTAINER_TYPES.Redis) private readonly redis: ExtendedRedis,
    @inject(CONTAINER_TYPES.AuditLogService)
    private readonly auditLog: IAuditLogService,
    @inject(CONTAINER_TYPES.AuditQueueService)
    private readonly auditQueue: IAuditQueueService,
    @inject(CONTAINER_TYPES.AuditReportQueueService)
    private readonly auditReportQueue: IAuditReportQueueService,
    @inject(CONTAINER_TYPES.PsiClient)
    private readonly psi: IPsiClient,
    @inject(CONTAINER_TYPES.CruxClient)
    private readonly crux: ICruxClient
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
      throw new Error(`Site not found: ${siteId}`);
    }
    return siteAuditData;
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
      await this.db
        .insert(AuditItemTable)
        .values(
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
        )
        .onConflictDoNothing({
          target: [
            AuditItemTable.siteAuditId,
            AuditItemTable.checklistKey,
            AuditItemTable.url,
          ],
        });
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
      await this.auditQueue.enqueueRunCheckItem(
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

  public async runCheck(payload: RunCheckItemJobPayload): Promise<CheckResult> {
    const { siteAuditId, checklistKey, url } = payload;

    const item = getChecklistItem(checklistKey);
    if (!item || !item.checkFn) {
      throw new Error(
        `Checklist item not found or not automatable: ${checklistKey}`
      );
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

    const values = {
      status: result.status as AuditItemStatusEnumType,
      message: result.message,
      evidence: result.evidence ?? null,
      durationMs,
      section: item.section,
      title: item.title,
      updatedAt: new Date(),
    };

    await this.db
      .insert(AuditItemTable)
      .values({
        siteAuditId,
        checklistKey: item.key,
        url,
        ...values,
      })
      .onConflictDoUpdate({
        target: [
          AuditItemTable.siteAuditId,
          AuditItemTable.checklistKey,
          AuditItemTable.url,
        ],
        set: values,
      });
  }

  private async incrementProgress(siteAuditId: string): Promise<void> {
    const totalKey = AUDIT_REDIS_KEYS.total(siteAuditId);
    const totalRaw = await this.redis.get(totalKey);
    const total = Number(totalRaw ?? 0);

    // Derive progress from the database rather than a Redis counter so retries
    // and duplicate deliveries can never over- or under-count.
    const completed = await this.db.$count(
      AuditItemTable,
      and(
        eq(AuditItemTable.siteAuditId, siteAuditId),
        ne(AuditItemTable.status, "pending")
      )
    );

    await this.auditLog.publish(siteAuditId, {
      type: "progress",
      message: `Progress ${completed}/${total}`,
      data: { completed, total },
    });

    await this.db
      .update(SiteAuditTable)
      .set({ completedItems: completed, updatedAt: new Date() })
      .where(eq(SiteAuditTable.id, siteAuditId));

    if (total > 0 && completed >= total) {
      await this.finalizeRun(siteAuditId);
    }
  }

  public async markCheckFailed(
    payload: RunCheckItemJobPayload,
    message: string
  ): Promise<void> {
    const { siteAuditId, checklistKey, url } = payload;
    const item = getChecklistItem(checklistKey);

    if (item) {
      await this.persistItem({
        siteAuditId,
        item,
        url,
        result: { status: "error", message },
        durationMs: 0,
      });
    }

    await this.incrementProgress(siteAuditId);
  }

  public async markRunFailed(
    siteAuditId: string,
    message: string
  ): Promise<void> {
    await this.db
      .update(SiteAuditTable)
      .set({
        status: "failed",
        error: message,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(SiteAuditTable.id, siteAuditId));

    await this.auditLog.publish(siteAuditId, {
      type: "run_failed",
      level: "error",
      message: `Audit run failed: ${message}`,
    });

    await this.auditLog.persistRun(siteAuditId);
  }

  private async finalizeRun(siteAuditId: string): Promise<void> {
    const finalizedKey = AUDIT_REDIS_KEYS.finalized(siteAuditId);
    const acquired = await this.redis.set(
      finalizedKey,
      "1",
      "EX",
      AUDIT_LOG_DEFAULTS.logStreamTtlSeconds,
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
      await this.auditReportQueue.enqueueGenerateReportImage(
        siteAuditId,
        `report_image_${siteAuditId}`
      );
    } catch (err) {
      console.error(err);
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
    const metricMatch = (column: AnyPgColumn, value: number | null) =>
      value === null ? isNull(column) : eq(column, value);

    // Skip exact duplicates (e.g. a re-run or an unchanged monthly sync) so
    // snapshots do not grow without bound.
    const [existing] = await this.db
      .select({ id: CwvSnapshotTable.id })
      .from(CwvSnapshotTable)
      .where(
        and(
          eq(CwvSnapshotTable.siteAuditId, siteAuditId),
          eq(CwvSnapshotTable.url, snapshot.url),
          eq(CwvSnapshotTable.strategy, snapshot.strategy),
          eq(CwvSnapshotTable.source, snapshot.source),
          metricMatch(CwvSnapshotTable.lcp, snapshot.lcp),
          metricMatch(CwvSnapshotTable.inp, snapshot.inp),
          metricMatch(CwvSnapshotTable.cls, snapshot.cls)
        )
      )
      .limit(1);

    if (existing) return;

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
}

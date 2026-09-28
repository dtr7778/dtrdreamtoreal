import { and, asc, eq, or } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { inject } from "inversify";

import {
  AuditItemTable,
  AuditLogTable,
  CompanyTable,
  CwvSnapshotTable,
  FileTable,
  InsertSiteAudit,
  type SelectAuditItem,
  type SelectSiteAudit,
  SiteAuditDataModel,
  SiteAuditTable,
  UpdateSiteAudit,
} from "@workspace/drizzle/schemas";
import type { DatabaseType } from "@workspace/drizzle/types";
import type { IStorageService } from "@workspace/lib/supabase/storage";
import { formatError } from "@workspace/lib/utils";
import type { ExtendedRedis } from "@workspace/redis/client/ioRedis";
import { ApiError } from "@workspace/server-core/framework";
import { AUDIT_REDIS_KEYS } from "@workspace/server-core/services";

import { API_MESSAGE } from "@/constant";
import { CONTAINER_TYPES } from "@/container/container-types";

import { type IAuditQueueService } from "./AuditQueue.service";

/** Storage path prefix used by the worker for generated report images. */
const AUDIT_REPORT_IMAGE_PATH = "audit_report_image";

/** Ephemeral Redis state owned by an audit run (crawl cache, counters, logs). */
function auditRunRedisKeys(siteAuditId: string): string[] {
  return [
    AUDIT_REDIS_KEYS.logStream(siteAuditId),
    AUDIT_REDIS_KEYS.logSequence(siteAuditId),
    `audit:crawl:${siteAuditId}`,
    `audit:run:${siteAuditId}:progress`,
    `audit:run:${siteAuditId}:total`,
    `audit:run:${siteAuditId}:finalized`,
  ];
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
  getResults(siteAuditId: string): Promise<{
    siteAudit: SelectSiteAudit;
    summary: AuditResultsSummary;
    sections: AuditSectionResult[];
  }>;
  /** Delete a run and every record/object that belongs to it. */
  deleteSiteAudit(siteAuditId: string): Promise<void>;
}

export class AuditService implements IAuditService {
  constructor(
    @inject(CONTAINER_TYPES.Drizzle) private readonly db: DatabaseType,
    @inject(CONTAINER_TYPES.Redis) private readonly redis: ExtendedRedis,
    @inject(CONTAINER_TYPES.AuditQueueService)
    private readonly auditQueue: IAuditQueueService,
    @inject(CONTAINER_TYPES.Storage)
    private readonly storage: IStorageService
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

  public async createSiteAudit(
    companyId: string,
    name: string,
    url: string,
    description?: string | undefined
  ): Promise<SelectSiteAudit> {
    const [companyData] = await this.db
      .select({ id: CompanyTable.id })
      .from(CompanyTable)
      .where(eq(CompanyTable.id, companyId))
      .limit(1);

    if (!companyData) {
      throw new ApiError({
        statusCode: StatusCodes.NOT_FOUND,
        message: API_MESSAGE.COMPANY.NOT_FOUND,
      });
    }

    const [insertedSiteAudit] = await this.db
      .insert(SiteAuditTable)
      .values({
        status: "pending",
        companyId: companyData.id,
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

  public async deleteSiteAudit(siteAuditId: string): Promise<void> {
    const [existing] = await this.db
      .select({
        id: SiteAuditTable.id,
        reportImageFileId: SiteAuditTable.reportImageFileId,
      })
      .from(SiteAuditTable)
      .where(eq(SiteAuditTable.id, siteAuditId))
      .limit(1);

    if (!existing) {
      throw new ApiError({
        statusCode: StatusCodes.NOT_FOUND,
        message: API_MESSAGE.SITE_AUDIT.NOT_FOUND,
      });
    }

    const reportImageWhere = existing.reportImageFileId
      ? or(
          eq(FileTable.id, existing.reportImageFileId),
          and(
            eq(FileTable.entityType, "audit_report_image"),
            eq(FileTable.entityId, existing.id)
          )
        )
      : and(
          eq(FileTable.entityType, "audit_report_image"),
          eq(FileTable.entityId, existing.id)
        );

    // Collect the storage keys before the rows are removed.
    const reportImages = await this.db
      .select({ key: FileTable.key })
      .from(FileTable)
      .where(reportImageWhere);

    // Delete the run's child records first, then the file metadata and the run
    // itself, atomically.
    await this.db.transaction(async (tx) => {
      await tx
        .delete(AuditItemTable)
        .where(eq(AuditItemTable.siteAuditId, existing.id));
      await tx
        .delete(CwvSnapshotTable)
        .where(eq(CwvSnapshotTable.siteAuditId, existing.id));
      await tx
        .delete(AuditLogTable)
        .where(eq(AuditLogTable.siteAuditId, existing.id));
      await tx.delete(FileTable).where(reportImageWhere);
      await tx.delete(SiteAuditTable).where(eq(SiteAuditTable.id, existing.id));
    });

    // The delete has committed; clean up the storage objects and ephemeral
    // Redis state without failing the request if either fails.
    await Promise.all(
      reportImages.map((image) =>
        this.storage
          .delete(image.key, AUDIT_REPORT_IMAGE_PATH)
          .catch(() => undefined)
      )
    );
    await this.redis
      .del(...auditRunRedisKeys(existing.id))
      .catch(() => undefined);
  }
}

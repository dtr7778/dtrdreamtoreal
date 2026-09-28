import { asc, eq } from "drizzle-orm";
import { inject } from "inversify";

import {
  AuditItemTable,
  FileTable,
  type InsertFile,
  type SelectAuditItem,
  type SelectFile,
  SiteAuditTable,
} from "@workspace/drizzle/schemas";
import type { DatabaseType } from "@workspace/drizzle/types";
import {
  type AuditReportSection,
  type AuditReportSummary,
  generateAuditReportImage,
} from "@workspace/generate-image";
import type { IStorageService } from "@workspace/lib/supabase/storage";
import { formatError } from "@workspace/lib/utils";
import { type IAuditLogService } from "@workspace/server-core/services";

import { CONTAINER_TYPES } from "@/container/container-types";

/** Storage path prefix for generated audit report images. */
export const AUDIT_REPORT_IMAGE_PATH = "audit_report_image";

export interface IAuditReportService {
  /** Renders the report image, uploads it to storage and persists file metadata. */
  generateReportImage(siteAuditId: string): Promise<SelectFile>;
}

export class AuditReportService implements IAuditReportService {
  constructor(
    @inject(CONTAINER_TYPES.Drizzle) private readonly db: DatabaseType,
    @inject(CONTAINER_TYPES.Storage) private readonly storage: IStorageService,
    @inject(CONTAINER_TYPES.AuditLogService)
    private readonly auditLog: IAuditLogService
  ) {}

  public async generateReportImage(siteAuditId: string): Promise<SelectFile> {
    await this.auditLog.publish(siteAuditId, {
      type: "report_started",
      level: "info",
      message: "Generating audit report image",
    });

    try {
      const saved = await this.renderReportImage(siteAuditId);

      await this.auditLog.publish(siteAuditId, {
        type: "report_generated",
        level: "info",
        message: "Audit report image is ready",
        data: { fileId: saved.id, url: saved.url },
      });

      await this.auditLog.persistRun(siteAuditId);

      return saved;
    } catch (error) {
      await this.auditLog
        .publish(siteAuditId, {
          type: "report_failed",
          level: "error",
          message: `Failed to generate audit report image: ${formatError(error)}`,
        })
        .catch(() => undefined);

      // Do not let a persistence failure mask the original rendering error.
      await this.auditLog.persistRun(siteAuditId).catch(() => undefined);

      throw error;
    }
  }

  private async renderReportImage(siteAuditId: string): Promise<SelectFile> {
    const [siteAudit] = await this.db
      .select()
      .from(SiteAuditTable)
      .where(eq(SiteAuditTable.id, siteAuditId))
      .limit(1);

    if (!siteAudit) {
      throw new Error(`Site audit not found: ${siteAuditId}`);
    }

    const items = await this.db
      .select()
      .from(AuditItemTable)
      .where(eq(AuditItemTable.siteAuditId, siteAuditId))
      .orderBy(asc(AuditItemTable.section));

    const png = await generateAuditReportImage({
      siteName: siteAudit.name,
      url: siteAudit.url,
      status: siteAudit.status,
      companyName: undefined,
      generatedAt: new Date(),
      summary: buildSummary(items),
      sections: buildSections(items),
    });

    const filename = `audit-report-${siteAuditId}.png`;
    const uploaded = await this.storage.store(
      new Blob([png], { type: "image/png" }),
      filename,
      AUDIT_REPORT_IMAGE_PATH
    );

    const { signedUrl } = await this.storage.getSignedDownloadUrl(
      uploaded.key,
      AUDIT_REPORT_IMAGE_PATH
    );

    try {
      const saved = await this.db.transaction(async (tx) => {
        const [file] = await tx
          .insert(FileTable)
          .values({
            key: uploaded.key,
            filename,
            originalName: siteAudit.name,
            mimeType: "image/png",
            size: png.length,
            url: signedUrl,
            entityType: "audit_report_image" as const,
            entityId: siteAudit.id,
          } satisfies InsertFile)
          .returning();

        if (!file) {
          throw new Error("Failed to persist audit report image metadata");
        }

        await tx
          .update(SiteAuditTable)
          .set({ reportImageFileId: file.id, updatedAt: new Date() })
          .where(eq(SiteAuditTable.id, siteAudit.id));

        return file;
      });

      return saved;
    } catch (error) {
      // Roll back the orphaned storage object if persistence failed.
      await this.storage
        .delete(uploaded.key, AUDIT_REPORT_IMAGE_PATH)
        .catch(() => undefined);
      throw error;
    }
  }
}

function buildSummary(items: SelectAuditItem[]): AuditReportSummary {
  const summary: AuditReportSummary = {
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
  }

  return summary;
}

function buildSections(items: SelectAuditItem[]): AuditReportSection[] {
  const sectionMap = new Map<string, AuditReportSection>();

  for (const item of items) {
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
  }

  return [...sectionMap.values()];
}

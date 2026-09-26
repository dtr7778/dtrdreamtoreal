import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMockDrizzleClient,
  type MockDatabaseType,
} from "@workspace/drizzle/client/mock";
import {
  AuditItemTable,
  CompanyTable,
  FileTable,
  SiteAuditTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import type { DatabaseType } from "@workspace/drizzle/types";
import type { IStorageService } from "@workspace/lib/supabase/storage";

import {
  AUDIT_REPORT_IMAGE_PATH,
  AuditReportImageService,
} from "./AuditReport.service";

function createStorageMock() {
  const store = vi.fn(async (file: Blob, filename: string, path?: string) => ({
    id: "storage-id",
    path: path ? `${path}/${filename}` : filename,
    fullPath: path ? `${path}/${filename}` : filename,
    key: `generated-${filename}`,
    filename,
    size: file.size,
    mimeType: "image/png",
    uploadedAt: new Date(),
  }));

  const getSignedDownloadUrl = vi.fn(async (key: string, path?: string) => ({
    signedUrl: `https://cdn.example.com/${path ?? ""}/${key}`,
    expiresAt: undefined,
  }));

  return {
    store,
    getSignedDownloadUrl,
  } as unknown as IStorageService & {
    store: typeof store;
    getSignedDownloadUrl: typeof getSignedDownloadUrl;
  };
}

describe("AuditReportImageService", () => {
  let db: MockDatabaseType;
  let storage: ReturnType<typeof createStorageMock>;
  let service: AuditReportImageService;
  let siteAuditId: string;

  beforeEach(async () => {
    db = await createMockDrizzleClient();
    storage = createStorageMock();
    service = new AuditReportImageService(
      db as unknown as DatabaseType,
      storage
    );

    const [user] = await db
      .insert(UserTable)
      .values({ name: "Auditor", email: "auditor@example.com", role: "ADMIN" })
      .returning();

    const [company] = await db
      .insert(CompanyTable)
      .values({ id: user!.id, name: "Acme", createdBy: user!.id })
      .returning();

    const [siteAudit] = await db
      .insert(SiteAuditTable)
      .values({
        companyId: company!.id,
        name: "Acme site",
        url: "https://example.com",
        status: "completed",
      })
      .returning();

    siteAuditId = siteAudit!.id;

    await db.insert(AuditItemTable).values([
      {
        siteAuditId,
        checklistKey: "seo.title",
        section: "SEO",
        title: "Title tag",
        status: "passed",
        url: "https://example.com",
      },
      {
        siteAuditId,
        checklistKey: "seo.meta",
        section: "SEO",
        title: "Meta description",
        status: "failed",
        url: "https://example.com",
      },
    ]);
  });

  it("renders, uploads and persists the report image metadata", async () => {
    const file = await service.generateReportImage(siteAuditId);

    expect(storage.store).toHaveBeenCalledTimes(1);
    expect(storage.store.mock.calls[0]?.[1]).toBe(
      `audit-report-${siteAuditId}.png`
    );
    expect(storage.store.mock.calls[0]?.[2]).toBe(AUDIT_REPORT_IMAGE_PATH);

    const [blob] = storage.store.mock.calls[0]!;
    expect(blob.type).toBe("image/png");
    expect(blob.size).toBeGreaterThan(10_000);

    expect(file.entityType).toBe("audit_report_image");
    expect(file.entityId).toBe(siteAuditId);
    expect(file.mimeType).toBe("image/png");
    expect(file.url).toContain("cdn.example.com");

    const rows = await db.select().from(FileTable);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.id).toBe(file.id);

    const [updated] = await db
      .select({ reportImageFileId: SiteAuditTable.reportImageFileId })
      .from(SiteAuditTable)
      .where(eq(SiteAuditTable.id, siteAuditId))
      .limit(1);
    expect(updated?.reportImageFileId).toBe(file.id);
  });
});

import { describe, expect, it } from "vitest";

import type { AuditReportImageData } from "../components/audit-report-card";
import { generateAuditReportImage } from "./render-audit-report";

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

const data: AuditReportImageData = {
  siteName: "Acme Store",
  url: "https://acme.example.com",
  status: "completed",
  companyName: "Acme Inc",
  generatedAt: new Date("2026-01-01T00:00:00Z"),
  summary: {
    total: 20,
    completed: 20,
    passed: 14,
    failed: 3,
    warning: 2,
    needsReview: 1,
    error: 0,
    skipped: 0,
    pending: 0,
  },
  sections: [
    { section: "SEO", total: 10, passed: 8, failed: 2 },
    { section: "Performance", total: 6, passed: 3, failed: 1 },
  ],
};

describe("generateAuditReportImage", () => {
  it("renders a valid PNG buffer", async () => {
    const buffer = await generateAuditReportImage(data);

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.subarray(0, 4).equals(PNG_MAGIC)).toBe(true);
    expect(buffer.length).toBeGreaterThan(10_000);
  });
});

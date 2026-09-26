/** @jsxRuntime automatic */
import type { ReactElement } from "react";

const COLORS = {
  background: "#f1f5f9",
  surface: "#ffffff",
  header: "#0f172a",
  brand: "#38bdf8",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  passed: "#16a34a",
  failed: "#dc2626",
  warning: "#d97706",
  review: "#7c3aed",
  track: "#e2e8f0",
} as const;

export interface AuditReportSummary {
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

function passRate(summary: AuditReportSummary): number {
  if (summary.total <= 0) return 0;
  return Math.round((summary.passed / summary.total) * 100);
}

function formatDate(date: Date | undefined): string {
  return (date ?? new Date()).toUTCString().replace("GMT", "UTC");
}

function StatCard(props: {
  label: string;
  value: number;
  color: string;
}): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 18,
        padding: "18px 20px",
        gap: 6,
      }}
    >
      <div style={{ display: "flex", fontSize: 15, color: COLORS.muted }}>
        {props.label}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 40,
          fontWeight: 700,
          color: props.color,
        }}
      >
        {String(props.value)}
      </div>
    </div>
  );
}

export interface AuditReportSection {
  section: string;
  total: number;
  passed: number;
  failed: number;
}

function SectionRow(props: { section: AuditReportSection }): ReactElement {
  const { section } = props;
  const rate =
    section.total > 0 ? Math.round((section.passed / section.total) * 100) : 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "14px 0",
        borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", fontSize: 20, color: COLORS.text }}>
          {section.section}
        </div>
        <div style={{ display: "flex", fontSize: 18, color: COLORS.muted }}>
          {`${section.passed}/${section.total} passed`}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          height: 12,
          width: "100%",
          backgroundColor: COLORS.track,
          borderRadius: 999,
        }}
      >
        <div
          style={{
            display: "flex",
            height: 12,
            width: `${rate}%`,
            backgroundColor: COLORS.passed,
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}

export interface AuditReportImageData {
  siteName: string;
  url: string;
  status: string;
  companyName?: string;
  generatedAt?: Date;
  summary: AuditReportSummary;
  sections?: AuditReportSection[];
}

export function AuditReportCard(props: {
  data: AuditReportImageData;
}): ReactElement {
  const { data } = props;
  const { summary } = data;
  const rate = passRate(summary);
  const rateColor =
    rate >= 80 ? COLORS.passed : rate >= 50 ? COLORS.warning : COLORS.failed;
  const sections = (data.sections ?? []).slice(0, 8);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: COLORS.background,
        fontFamily: "Inter",
        color: COLORS.text,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: COLORS.header,
          padding: "44px 56px",
          gap: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 700,
              color: COLORS.brand,
            }}
          >
            DTR
          </div>
          <div style={{ display: "flex", fontSize: 18, color: "#94a3b8" }}>
            {formatDate(data.generatedAt)}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 52,
            fontWeight: 700,
            color: "#f8fafc",
          }}
        >
          Site Audit Report
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#cbd5e1" }}>
          {data.companyName ? `${data.companyName} · ` : ""}
          {data.siteName}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: 56,
          gap: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 24,
            padding: "28px 36px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: 210,
              height: 210,
              borderRadius: 999,
              border: `14px solid ${rateColor}`,
              gap: 2,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 68,
                fontWeight: 700,
                color: rateColor,
              }}
            >
              {`${rate}%`}
            </div>
            <div style={{ display: "flex", fontSize: 16, color: COLORS.muted }}>
              PASS RATE
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: 12,
            }}
          >
            <div style={{ display: "flex", fontSize: 24, color: COLORS.text }}>
              {data.url}
            </div>
            <div style={{ display: "flex", fontSize: 18, color: COLORS.muted }}>
              {`Status: ${data.status}`}
            </div>
            <div style={{ display: "flex", fontSize: 18, color: COLORS.muted }}>
              {`${summary.passed} of ${summary.total} checks passed`}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 18 }}>
          <StatCard label="Total" value={summary.total} color={COLORS.text} />
          <StatCard
            label="Passed"
            value={summary.passed}
            color={COLORS.passed}
          />
          <StatCard
            label="Failed"
            value={summary.failed + summary.error}
            color={COLORS.failed}
          />
          <StatCard
            label="Warnings"
            value={summary.warning}
            color={COLORS.warning}
          />
          <StatCard
            label="Needs review"
            value={summary.needsReview}
            color={COLORS.review}
          />
        </div>

        {sections.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 24,
              padding: "12px 32px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 700,
                padding: "16px 0",
              }}
            >
              Breakdown by section
            </div>
            {sections.map((section) => (
              <SectionRow key={section.section} section={section} />
            ))}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 56px",
          borderTop: `1px solid ${COLORS.border}`,
          color: COLORS.muted,
          fontSize: 16,
        }}
      >
        <div style={{ display: "flex" }}>Generated by DTR Audit Engine</div>
        <div style={{ display: "flex" }}>{data.siteName}</div>
      </div>
    </div>
  );
}

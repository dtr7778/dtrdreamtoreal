/** @jsxRuntime automatic */
import type { ReactElement } from "react";

const COLORS = {
  background: "#eef2f7",
  surface: "#ffffff",
  ink: "#0f172a",
  inkSoft: "#334155",
  muted: "#64748b",
  border: "#e2e8f0",
  track: "#eef2f7",
  brand: "#38bdf8",
  brandDeep: "#2563eb",
  navy0: "#0b1220",
  navy1: "#16243f",
  navy2: "#1e3a5f",
  passed: "#16a34a",
  failed: "#ef4444",
  warning: "#f59e0b",
  review: "#8b5cf6",
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

export interface AuditReportSection {
  section: string;
  total: number;
  passed: number;
  failed: number;
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

function passRate(summary: AuditReportSummary): number {
  if (summary.total <= 0) return 0;
  return Math.round((summary.passed / summary.total) * 100);
}

function formatDate(date: Date | undefined): string {
  return (date ?? new Date()).toUTCString().replace("GMT", "UTC");
}

function rateColor(rate: number): string {
  if (rate >= 80) return COLORS.passed;
  if (rate >= 50) return COLORS.warning;
  return COLORS.failed;
}

function gradeFor(rate: number): string {
  if (rate >= 90) return "A+";
  if (rate >= 80) return "A";
  if (rate >= 70) return "B";
  if (rate >= 60) return "C";
  if (rate >= 50) return "D";
  return "F";
}

function sectionRate(section: AuditReportSection): number {
  return section.total > 0
    ? Math.round((section.passed / section.total) * 100)
    : 0;
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
        gap: 12,
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 22,
        padding: "18px 20px",
        boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            display: "flex",
            width: 12,
            height: 12,
            borderRadius: 999,
            backgroundColor: props.color,
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            color: COLORS.muted,
          }}
        >
          {props.label}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 38,
          fontWeight: 800,
          lineHeight: 1,
          color: COLORS.ink,
        }}
      >
        {String(props.value)}
      </div>
    </div>
  );
}

function SectionRow(props: { section: AuditReportSection }): ReactElement {
  const { section } = props;
  const rate = sectionRate(section);
  const color = rateColor(rate);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "9px 0",
        borderBottom: `1px solid #f1f5f9`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", fontSize: 16, fontWeight: 600, color: COLORS.ink }}>
          {section.section}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
          <div style={{ display: "flex", fontSize: 14, fontWeight: 700, color }}>
            {`${section.passed}`}
          </div>
          <div style={{ display: "flex", fontSize: 13, fontWeight: 500, color: COLORS.muted }}>
            {`/ ${section.total} passed`}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          height: 9,
          width: "100%",
          backgroundColor: COLORS.track,
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            height: 9,
            width: `${rate}%`,
            borderRadius: 999,
            backgroundImage: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
          }}
        />
      </div>
    </div>
  );
}

export function AuditReportCard(props: {
  data: AuditReportImageData;
}): ReactElement {
  const { data } = props;
  const { summary } = data;
  const rate = passRate(summary);
  const color = rateColor(rate);
  const grade = gradeFor(rate);
  const sections = (data.sections ?? []).slice(0, 5);
  const failed = summary.failed + summary.error;

  const stats: Array<{ label: string; value: number; color: string }> = [
    { label: "Checks", value: summary.total, color: COLORS.brandDeep },
    { label: "Passed", value: summary.passed, color: COLORS.passed },
    { label: "Failed", value: failed, color: COLORS.failed },
    { label: "Warnings", value: summary.warning, color: COLORS.warning },
    { label: "Review", value: summary.needsReview, color: COLORS.review },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: COLORS.background,
        fontFamily: "Inter",
        color: COLORS.ink,
      }}
    >
      {/* Hero */}
      <div
        style={{
          display: "flex",
          position: "relative",
          overflow: "hidden",
          padding: "40px 56px",
          backgroundColor: COLORS.navy0,
          backgroundImage: `linear-gradient(135deg, ${COLORS.navy0} 0%, ${COLORS.navy1} 55%, ${COLORS.navy2} 100%)`,
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: -140,
            right: -70,
            width: 440,
            height: 440,
            borderRadius: 999,
            backgroundImage:
              "radial-gradient(circle, rgba(56,189,248,0.38) 0%, rgba(56,189,248,0) 70%)",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: -170,
            left: -70,
            width: 400,
            height: 400,
            borderRadius: 999,
            backgroundImage:
              "radial-gradient(circle, rgba(37,99,235,0.34) 0%, rgba(37,99,235,0) 70%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "space-between",
            gap: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  backgroundImage: `linear-gradient(135deg, ${COLORS.brand} 0%, ${COLORS.brandDeep} 100%)`,
                  boxShadow: "0 10px 24px rgba(37, 99, 235, 0.45)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 16,
                    fontWeight: 800,
                    letterSpacing: 0.5,
                    color: "#ffffff",
                  }}
                >
                  DTR
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <div
                  style={{
                    display: "flex",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 2.4,
                    color: "#93c5fd",
                  }}
                >
                  WEBSITE AUDIT
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 13,
                    fontWeight: 400,
                    color: "#94a3b8",
                  }}
                >
                  {formatDate(data.generatedAt)}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 48,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: -0.6,
                color: "#f8fafc",
              }}
            >
              Site Audit Report
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "6px 12px",
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.16)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: color,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#e2e8f0",
                    textTransform: "capitalize",
                  }}
                >
                  {data.status}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 21,
                  fontWeight: 500,
                  color: "#cbd5e1",
                }}
              >
                {data.companyName ? `${data.companyName} · ` : ""}
                {data.siteName}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 17,
                fontWeight: 500,
                color: "#7dd3fc",
              }}
            >
              {data.url}
            </div>
          </div>

          {/* Score panel */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              width: 252,
              padding: "28px 26px",
              borderRadius: 30,
              backgroundColor: "rgba(255,255,255,0.06)",
              backgroundImage:
                "linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.02) 100%)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 24px 60px rgba(2, 6, 23, 0.45)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.22)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 17,
                    fontWeight: 800,
                    color,
                  }}
                >
                  {grade}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: 2,
                  color: "#93c5fd",
                }}
              >
                GRADE
              </div>
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 76,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: -1.5,
                color,
              }}
            >
              {`${rate}%`}
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 2.6,
                color: "#94a3b8",
              }}
            >
              PASS RATE
            </div>

            <div
              style={{
                display: "flex",
                height: 8,
                width: "100%",
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.12)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  height: 8,
                  width: `${rate}%`,
                  borderRadius: 999,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          gap: 20,
          padding: "34px 56px",
        }}
      >
        <div style={{ display: "flex", gap: 16 }}>
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            borderRadius: 24,
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            padding: "18px 28px",
            boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 20,
                fontWeight: 700,
                color: COLORS.ink,
              }}
            >
              Breakdown by section
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 13,
                fontWeight: 500,
                color: COLORS.muted,
              }}
            >
              {`${summary.passed} / ${summary.total} checks passed`}
            </div>
          </div>

          {sections.length > 0 ? (
            sections.map((section) => (
              <SectionRow key={section.section} section={section} />
            ))
          ) : (
            <div
              style={{
                display: "flex",
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                color: COLORS.muted,
              }}
            >
              No section data available.
            </div>
          )}

          <div style={{ display: "flex", flex: 1 }} />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 18,
              paddingTop: 14,
              borderTop: `1px solid #f1f5f9`,
            }}
          >
            {[
              { label: "Passed", value: summary.passed, color: COLORS.passed },
              { label: "Failed", value: failed, color: COLORS.failed },
              {
                label: "Warnings",
                value: summary.warning,
                color: COLORS.warning,
              },
              {
                label: "Review",
                value: summary.needsReview,
                color: COLORS.review,
              },
              {
                label: "Pending",
                value: summary.pending + summary.skipped,
                color: COLORS.muted,
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <div
                  style={{
                    display: "flex",
                    width: 9,
                    height: 9,
                    borderRadius: 999,
                    backgroundColor: item.color,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    fontSize: 13,
                    fontWeight: 500,
                    color: COLORS.muted,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 13,
                    fontWeight: 700,
                    color: COLORS.ink,
                  }}
                >
                  {String(item.value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 56px",
          backgroundColor: COLORS.surface,
          borderTop: `1px solid ${COLORS.border}`,
          fontSize: 14,
          color: COLORS.muted,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              display: "flex",
              width: 10,
              height: 10,
              borderRadius: 999,
              backgroundImage: `linear-gradient(135deg, ${COLORS.brand} 0%, ${COLORS.brandDeep} 100%)`,
            }}
          />
          <div style={{ display: "flex", fontWeight: 500 }}>
            Generated by DTR Audit Engine
          </div>
        </div>
        <div style={{ display: "flex", fontWeight: 600, color: COLORS.inkSoft }}>
          {data.siteName}
        </div>
      </div>
    </div>
  );
}

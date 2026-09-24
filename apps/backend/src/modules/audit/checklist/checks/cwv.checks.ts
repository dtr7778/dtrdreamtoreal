import type { CheckContext, CheckResult } from "../types";

interface MetricThreshold {
  good: number;
  poor: number;
}

const THRESHOLDS: Record<
  "mobile" | "desktop",
  Record<string, MetricThreshold>
> = {
  mobile: {
    lcp: { good: 2500, poor: 4000 },
    inp: { good: 200, poor: 500 },
    cls: { good: 0.1, poor: 0.25 },
  },
  desktop: {
    lcp: { good: 2500, poor: 4000 },
    inp: { good: 200, poor: 500 },
    cls: { good: 0.1, poor: 0.25 },
  },
};

type Rating = "good" | "needs-improvement" | "poor" | "unknown";

function rate(
  value: number | null,
  strategy: "mobile" | "desktop",
  metric: string
): Rating {
  if (value === null) return "unknown";
  const threshold = THRESHOLDS[strategy][metric];
  if (!threshold) return "unknown";
  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

const RATING_ORDER: Rating[] = ["unknown", "good", "needs-improvement", "poor"];

function worstRating(ratings: Rating[]): Rating {
  let worst: Rating = "good";
  for (const rating of ratings) {
    if (RATING_ORDER.indexOf(rating) > RATING_ORDER.indexOf(worst)) {
      worst = rating;
    }
  }
  return worst;
}

export async function coreWebVitalsCheck(
  context: CheckContext
): Promise<CheckResult> {
  const url = context.url;
  const errors: string[] = [];

  let mobile = null;
  let desktop = null;

  try {
    mobile = await context.runPsi(url, "mobile");
  } catch (err) {
    errors.push(
      `mobile: ${err instanceof Error ? err.message : "PSI request failed"}`
    );
  }

  try {
    desktop = await context.runPsi(url, "desktop");
  } catch (err) {
    errors.push(
      `desktop: ${err instanceof Error ? err.message : "PSI request failed"}`
    );
  }

  const crux = await context.queryCrux(url, "phone").catch(() => null);

  if (mobile) {
    await context.storeCwv({
      url,
      strategy: "phone",
      source: "psi",
      lcp: mobile.lab.lcp,
      inp: mobile.lab.tbt,
      cls: mobile.lab.cls,
      ttfb: mobile.lab.ttfb,
      fcp: mobile.lab.fcp,
      performanceScore: mobile.performanceScore,
      countryCode: null,
    });
  }

  if (desktop) {
    await context.storeCwv({
      url,
      strategy: "desktop",
      source: "psi",
      lcp: desktop.lab.lcp,
      inp: desktop.lab.tbt,
      cls: desktop.lab.cls,
      ttfb: desktop.lab.ttfb,
      fcp: desktop.lab.fcp,
      performanceScore: desktop.performanceScore,
      countryCode: null,
    });
  }

  if (crux) {
    await context.storeCwv({
      url,
      strategy: "phone",
      source: "crux",
      lcp: crux.metrics.lcp,
      inp: crux.metrics.inp,
      cls: crux.metrics.cls,
      ttfb: crux.metrics.ttfb,
      fcp: crux.metrics.fcp,
      performanceScore: null,
      countryCode: null,
    });
  }

  if (!mobile && !desktop && !crux) {
    return {
      status: "error",
      message: "Core Web Vitals data could not be collected",
      evidence: { url, errors },
    };
  }

  const mobileRatings = mobile
    ? [
        rate(mobile.lab.lcp, "mobile", "lcp"),
        rate(mobile.lab.cls, "mobile", "cls"),
      ]
    : [];
  const desktopRatings = desktop
    ? [
        rate(desktop.lab.lcp, "desktop", "lcp"),
        rate(desktop.lab.cls, "desktop", "cls"),
      ]
    : [];
  const fieldRatings = crux
    ? [
        rate(crux.metrics.lcp, "mobile", "lcp"),
        rate(crux.metrics.inp, "mobile", "inp"),
        rate(crux.metrics.cls, "mobile", "cls"),
      ]
    : [];

  const worst = worstRating([
    ...mobileRatings,
    ...desktopRatings,
    ...fieldRatings,
  ]);

  const evidence = {
    url,
    lab: {
      mobile: mobile?.lab ?? null,
      desktop: desktop?.lab ?? null,
    },
    field: crux?.metrics ?? null,
    performanceScore: {
      mobile: mobile?.performanceScore ?? null,
      desktop: desktop?.performanceScore ?? null,
    },
    errors,
  };

  if (worst === "poor") {
    return {
      status: "failed",
      message: "Core Web Vitals are in the poor range",
      evidence,
    };
  }

  if (worst === "needs-improvement") {
    return {
      status: "warning",
      message: "Core Web Vitals need improvement",
      evidence,
    };
  }

  return {
    status: "passed",
    message: "Core Web Vitals are in the good range",
    evidence,
  };
}

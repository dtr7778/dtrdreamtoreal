import { inject, injectable } from "inversify";

import { CONTAINER_TYPES } from "@/container/container-types";
import { env } from "@/env";

import { GoogleApiCache } from "./google-cache";

export type PsiStrategy = "mobile" | "desktop";

export interface PsiLabMetrics {
  lcp: number | null;
  cls: number | null;
  tbt: number | null;
  fcp: number | null;
  ttfb: number | null;
  speedIndex: number | null;
}

export interface PsiFieldMetric {
  percentile: number;
  category: string;
}

export interface PsiFieldMetrics {
  lcp: PsiFieldMetric | null;
  inp: PsiFieldMetric | null;
  cls: PsiFieldMetric | null;
}

export interface PsiResult {
  url: string;
  strategy: PsiStrategy;
  performanceScore: number | null;
  seoScore: number | null;
  accessibilityScore: number | null;
  bestPracticesScore: number | null;
  lab: PsiLabMetrics;
  field: PsiFieldMetrics | null;
  originField: PsiFieldMetrics | null;
  fetchedAt: string;
}

interface PsiApiMetric {
  percentile?: number;
  category?: string;
}

interface PsiApiResponse {
  lighthouseResult?: {
    categories?: Record<string, { score?: number | null }>;
    audits?: Record<string, { numericValue?: number | null }>;
  };
  loadingExperience?: {
    metrics?: Record<string, PsiApiMetric>;
  };
  originLoadingExperience?: {
    metrics?: Record<string, PsiApiMetric>;
  };
}

function toFieldMetrics(
  metrics: Record<string, PsiApiMetric> | undefined,
  isCls: boolean
): PsiFieldMetrics | null {
  if (!metrics) return null;

  const pick = (key: string): PsiFieldMetric | null => {
    const metric = metrics[key];
    if (!metric || typeof metric.percentile !== "number") return null;
    const percentile =
      isCls && key === "CUMULATIVE_LAYOUT_SHIFT_SCORE"
        ? metric.percentile / 100
        : metric.percentile;
    return { percentile, category: metric.category ?? "UNKNOWN" };
  };

  const result: PsiFieldMetrics = {
    lcp: pick("LARGEST_CONTENTFUL_PAINT_MS"),
    inp: pick("INTERACTION_TO_NEXT_PAINT"),
    cls: pick("CUMULATIVE_LAYOUT_SHIFT_SCORE"),
  };

  if (!result.lcp && !result.inp && !result.cls) return null;
  return result;
}

export interface IPsiClient {
  run(url: string, strategy: PsiStrategy): Promise<PsiResult>;
}

@injectable()
export class PsiClient implements IPsiClient {
  constructor(
    @inject(CONTAINER_TYPES.GoogleApiCache)
    private readonly googleApiCache: GoogleApiCache
  ) {}

  public async run(url: string, strategy: PsiStrategy): Promise<PsiResult> {
    const endpoint = new URL(`${env.GOOGLE_PSI_BASE_URL}/runPagespeed`);
    endpoint.searchParams.set("url", url);
    endpoint.searchParams.set("strategy", strategy);
    endpoint.searchParams.set("key", env.GOOGLE_PSI_API_KEY);
    for (const category of [
      "performance",
      "seo",
      "accessibility",
      "best-practices",
    ]) {
      endpoint.searchParams.append("category", category);
    }

    const data = await this.googleApiCache.cachedJson<PsiApiResponse>(
      "psi",
      endpoint.toString()
    );

    const audits = data.lighthouseResult?.audits ?? {};
    const categories = data.lighthouseResult?.categories ?? {};

    const numeric = (key: string): number | null => {
      const value = audits[key]?.numericValue;
      return typeof value === "number" ? value : null;
    };

    const score = (key: string): number | null => {
      const value = categories[key]?.score;
      return typeof value === "number" ? value : null;
    };

    return {
      url,
      strategy,
      performanceScore: score("performance"),
      seoScore: score("seo"),
      accessibilityScore: score("accessibility"),
      bestPracticesScore: score("best-practices"),
      lab: {
        lcp: numeric("largest-contentful-paint"),
        cls: numeric("cumulative-layout-shift"),
        tbt: numeric("total-blocking-time"),
        fcp: numeric("first-contentful-paint"),
        ttfb: numeric("server-response-time"),
        speedIndex: numeric("speed-index"),
      },
      field: toFieldMetrics(data.loadingExperience?.metrics, true),
      originField: toFieldMetrics(data.originLoadingExperience?.metrics, true),
      fetchedAt: new Date().toISOString(),
    };
  }
}

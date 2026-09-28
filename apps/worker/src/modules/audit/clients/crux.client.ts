import { inject, injectable } from "inversify";

import { CwvStrategyEnumType } from "@workspace/drizzle/zod-db-enums";

import { CONTAINER_TYPES } from "@/container/container-types";
import { env } from "@/env";

import { GoogleApiCache } from "./google-cache";

export type CruxFormFactor = CwvStrategyEnumType;

export interface CruxMetrics {
  lcp: number | null;
  inp: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
}

export interface CruxRecord {
  target: string;
  formFactor: CruxFormFactor;
  metrics: CruxMetrics;
  collectionPeriod: { firstDate: string | null; lastDate: string | null };
  fetchedAt: string;
}

export interface CruxHistoryPoint {
  date: string;
  lcp: number | null;
  inp: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
}

export interface CruxHistory {
  target: string;
  formFactor: CruxFormFactor;
  points: CruxHistoryPoint[];
  fetchedAt: string;
}

interface CruxPercentile {
  p75?: number;
}

interface CruxMetric {
  percentiles?: CruxPercentile;
}

interface CruxApiRecord {
  key?: { origin?: string; url?: string; formFactor?: string };
  metrics?: Record<string, CruxMetric>;
  collectionPeriod?: {
    firstDate?: { year?: number; month?: number; day?: number };
    lastDate?: { year?: number; month?: number; day?: number };
  };
}

interface CruxApiResponse {
  record?: CruxApiRecord;
}

interface CruxHistorySeries {
  percentilesTimeseries?: {
    p75s?: Array<number | null>;
  };
}

interface CruxHistoryApiResponse {
  record?: {
    metrics?: Record<string, CruxHistorySeries>;
    collectionPeriods?: Array<{
      firstDate?: { year?: number; month?: number; day?: number };
      lastDate?: { year?: number; month?: number; day?: number };
    }>;
  };
}

const METRIC_KEYS = {
  lcp: "largest_contentful_paint",
  inp: "interaction_to_next_paint",
  cls: "cumulative_layout_shift",
  fcp: "first_contentful_paint",
  ttfb: "experimental_time_to_first_byte",
} as const;

function p75(record: CruxApiRecord | undefined, key: string): number | null {
  const value = record?.metrics?.[key]?.percentiles?.p75;
  return typeof value === "number" ? value : null;
}

function formatDate(
  date: { year?: number; month?: number; day?: number } | undefined
): string | null {
  if (!date?.year || !date.month || !date.day) return null;
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(
    date.day
  ).padStart(2, "0")}`;
}

function buildTarget(url: string): Record<string, string> {
  const parsed = new URL(url);
  const isOrigin = parsed.pathname === "/" && !parsed.search;
  return isOrigin ? { origin: parsed.origin } : { url: parsed.toString() };
}

export interface ICruxClient {
  queryRecord(
    url: string,
    formFactor?: "phone" | "desktop"
  ): Promise<CruxRecord | null>;
  queryHistory(
    url: string,
    formFactor?: "phone" | "desktop"
  ): Promise<CruxHistory | null>;
}

@injectable()
export class CruxClient implements ICruxClient {
  constructor(
    @inject(CONTAINER_TYPES.GoogleApiCache)
    private readonly googleApiCache: GoogleApiCache
  ) {}

  public async queryRecord(
    url: string,
    formFactor: CruxFormFactor = "phone"
  ): Promise<CruxRecord | null> {
    const endpoint = new URL(`${env.GOOGLE_CRUX_BASE_URL}/records:queryRecord`);
    endpoint.searchParams.set("key", env.GOOGLE_CRUX_API_KEY);

    const data = await this.googleApiCache.cachedJson<CruxApiResponse>(
      "crux",
      endpoint.toString(),
      {
        method: "POST",
        body: { ...buildTarget(url), formFactor: formFactor.toUpperCase() },
      }
    );

    const record = data.record;
    if (!record) return null;

    return {
      target: record.key?.url ?? record.key?.origin ?? url,
      formFactor,
      metrics: {
        lcp: p75(record, METRIC_KEYS.lcp),
        inp: p75(record, METRIC_KEYS.inp),
        cls: p75(record, METRIC_KEYS.cls),
        fcp: p75(record, METRIC_KEYS.fcp),
        ttfb: p75(record, METRIC_KEYS.ttfb),
      },
      collectionPeriod: {
        firstDate: formatDate(record.collectionPeriod?.firstDate),
        lastDate: formatDate(record.collectionPeriod?.lastDate),
      },
      fetchedAt: new Date().toISOString(),
    };
  }

  public async queryHistory(
    url: string,
    formFactor: CruxFormFactor = "phone"
  ): Promise<CruxHistory | null> {
    const endpoint = new URL(
      `${env.GOOGLE_CRUX_BASE_URL}/records:queryHistoryRecord`
    );
    endpoint.searchParams.set("key", env.GOOGLE_CRUX_API_KEY);

    const data = await this.googleApiCache.cachedJson<CruxHistoryApiResponse>(
      "crux-history",
      endpoint.toString(),
      {
        method: "POST",
        body: { ...buildTarget(url), formFactor: formFactor.toUpperCase() },
      }
    );

    const record = data.record;
    if (!record?.metrics) return null;

    const periods = record.collectionPeriods ?? [];
    const series = (key: string): Array<number | null> =>
      record.metrics?.[key]?.percentilesTimeseries?.p75s ?? [];

    const lcp = series(METRIC_KEYS.lcp);
    const inp = series(METRIC_KEYS.inp);
    const cls = series(METRIC_KEYS.cls);
    const fcp = series(METRIC_KEYS.fcp);
    const ttfb = series(METRIC_KEYS.ttfb);

    const points: CruxHistoryPoint[] = periods.map((period, index) => ({
      date: formatDate(period.lastDate) ?? String(index),
      lcp: lcp[index] ?? null,
      inp: inp[index] ?? null,
      cls: cls[index] ?? null,
      fcp: fcp[index] ?? null,
      ttfb: ttfb[index] ?? null,
    }));

    return {
      target: url,
      formFactor,
      points,
      fetchedAt: new Date().toISOString(),
    };
  }
}

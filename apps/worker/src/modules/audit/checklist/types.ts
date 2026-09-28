import type {
  CwvSourceEnumType,
  CwvStrategyEnumType,
} from "@workspace/drizzle/zod-db-enums";

import type { CruxRecord } from "../clients/crux.client";
import type { PsiResult, PsiStrategy } from "../clients/psi.client";
import type { CrawlResult } from "../lib/crawl";
import type { HttpFetchResult } from "../lib/http";
import type { RobotsData } from "../lib/robots";
import type { SitemapResult } from "../lib/sitemap";

export type CheckStatus =
  | "passed"
  | "failed"
  | "warning"
  | "needs_review"
  | "error"
  | "skipped";

export type CheckScope = "site" | "page";

export type AutomationLevel = "full" | "semi" | "manual";

export interface CheckResult {
  status: CheckStatus;
  message: string;
  evidence?: Record<string, unknown>;
}

export interface CwvSnapshotInput {
  url: string;
  strategy: CwvStrategyEnumType;
  source: CwvSourceEnumType;
  lcp: number | null;
  inp: number | null;
  cls: number | null;
  ttfb: number | null;
  fcp: number | null;
  performanceScore: number | null;
  countryCode: string | null;
}

export interface CheckContext {
  /** URL this specific check runs against (site root for site-scoped checks). */
  url: string;
  /** Site homepage / configured root URL. */
  siteUrl: string;
  /** Origin shared by all pages of the site. */
  origin: string;
  checklistKey: string;
  fetchPage: (url: string) => Promise<HttpFetchResult>;
  getCrawl: () => Promise<CrawlResult>;
  getRobots: () => Promise<RobotsData | null>;
  getSitemap: () => Promise<SitemapResult | null>;
  runPsi: (url: string, strategy: PsiStrategy) => Promise<PsiResult>;
  queryCrux: (
    url: string,
    formFactor?: CwvStrategyEnumType
  ) => Promise<CruxRecord | null>;
  storeCwv: (snapshot: CwvSnapshotInput) => Promise<void>;
}

export interface ChecklistItem {
  key: string;
  section: string;
  title: string;
  description: string;
  scope: CheckScope;
  automation: AutomationLevel;
  /** Optional cap on how many pages this check fans out to (expensive checks). */
  maxPages?: number;
  checkFn?: (context: CheckContext) => Promise<CheckResult>;
}

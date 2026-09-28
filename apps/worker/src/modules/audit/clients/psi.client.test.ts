import { describe, expect, it, vi } from "vitest";

import { GoogleApiCache } from "./google-cache";
import { PsiClient } from "./psi.client";

const PSI_FIXTURE = {
  lighthouseResult: {
    categories: { performance: { score: 0.82 }, seo: { score: 1 } },
    audits: {
      "largest-contentful-paint": { numericValue: 2100 },
      "cumulative-layout-shift": { numericValue: 0.05 },
      "total-blocking-time": { numericValue: 150 },
      "first-contentful-paint": { numericValue: 1200 },
      "server-response-time": { numericValue: 300 },
      "speed-index": { numericValue: 1800 },
    },
  },
  loadingExperience: {
    metrics: {
      LARGEST_CONTENTFUL_PAINT_MS: { percentile: 2300, category: "AVERAGE" },
      INTERACTION_TO_NEXT_PAINT: { percentile: 180, category: "FAST" },
      CUMULATIVE_LAYOUT_SHIFT_SCORE: { percentile: 8, category: "FAST" },
    },
  },
};

function createClient() {
  const cache = {
    cachedJson: vi.fn(async () => PSI_FIXTURE),
  } as unknown as GoogleApiCache;

  return { client: new PsiClient(cache), cache };
}

describe("PsiClient", () => {
  it("maps lighthouse lab metrics and scores", async () => {
    const { client } = createClient();
    const result = await client.run("https://example.com", "mobile");

    expect(result.performanceScore).toBe(0.82);
    expect(result.lab.lcp).toBe(2100);
    expect(result.lab.cls).toBe(0.05);
    expect(result.lab.tbt).toBe(150);
  });

  it("normalizes field CLS percentile to a fraction", async () => {
    const { client } = createClient();
    const result = await client.run("https://example.com", "mobile");

    expect(result.field?.lcp?.percentile).toBe(2300);
    expect(result.field?.cls?.percentile).toBeCloseTo(0.08);
  });

  it("requests the requested strategy", async () => {
    const { client, cache } = createClient();
    await client.run("https://example.com", "desktop");

    const calledUrl = (cache.cachedJson as ReturnType<typeof vi.fn>).mock
      .calls[0]?.[1] as string;
    expect(calledUrl).toContain("strategy=desktop");
  });
});

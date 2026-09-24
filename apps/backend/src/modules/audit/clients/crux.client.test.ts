import { describe, expect, it, vi } from "vitest";

import { CruxClient } from "./crux.client";
import { GoogleApiCache } from "./google-cache";

const CRUX_FIXTURE = {
  record: {
    key: { origin: "https://example.com", formFactor: "phone" },
    metrics: {
      largest_contentful_paint: { percentiles: { p75: 2400 } },
      interaction_to_next_paint: { percentiles: { p75: 190 } },
      cumulative_layout_shift: { percentiles: { p75: 0.09 } },
    },
    collectionPeriod: {
      firstDate: { year: 2026, month: 7, day: 1 },
      lastDate: { year: 2026, month: 7, day: 28 },
    },
  },
};

function createClient(fixture: unknown) {
  const cache = {
    cachedJson: vi.fn(async () => fixture),
  } as unknown as GoogleApiCache;

  return { client: new CruxClient(cache), cache };
}

describe("CruxClient", () => {
  it("maps CrUX field metrics", async () => {
    const { client } = createClient(CRUX_FIXTURE);
    const record = await client.queryRecord("https://example.com", "phone");

    expect(record?.metrics.lcp).toBe(2400);
    expect(record?.metrics.inp).toBe(190);
    expect(record?.metrics.cls).toBeCloseTo(0.09);
    expect(record?.collectionPeriod.lastDate).toBe("2026-07-28");
  });

  it("returns null when no record exists", async () => {
    const { client } = createClient({});
    expect(await client.queryRecord("https://example.com")).toBeNull();
  });

  it("maps CrUX history points", async () => {
    const { client } = createClient({
      record: {
        metrics: {
          largest_contentful_paint: {
            percentilesTimeseries: { p75s: [2500, 2300] },
          },
        },
        collectionPeriods: [
          { lastDate: { year: 2026, month: 6, day: 28 } },
          { lastDate: { year: 2026, month: 7, day: 28 } },
        ],
      },
    });

    const history = await client.queryHistory("https://example.com", "phone");
    expect(history?.points).toHaveLength(2);
    expect(history?.points[1]?.lcp).toBe(2300);
  });
});

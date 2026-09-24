import { describe, expect, it } from "vitest";

import {
  CHECKLIST,
  CHECKLIST_SECTIONS,
  getAutomatableItems,
  getManualItems,
} from "./registry";

describe("checklist registry", () => {
  it("has unique keys", () => {
    const keys = CHECKLIST.map((item) => item.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("uses only known sections", () => {
    for (const item of CHECKLIST) {
      expect(CHECKLIST_SECTIONS).toContain(item.section);
    }
  });

  it("gives every automatable item a check function", () => {
    for (const item of getAutomatableItems()) {
      expect(typeof item.checkFn).toBe("function");
    }
  });

  it("keeps manual items free of check functions", () => {
    for (const item of getManualItems()) {
      expect(item.checkFn).toBeUndefined();
    }
  });
});

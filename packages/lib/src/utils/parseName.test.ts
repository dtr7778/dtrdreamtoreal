import { describe, expect, it } from "vitest";

import { parseName, buildName } from "./parseName";

describe("parseName", () => {
  it("throws on empty string", () => {
    expect(() => parseName("")).toThrow("fullName cannot be an empty string");
  });

  it("throws on whitespace-only string", () => {
    expect(() => parseName("   ")).toThrow("fullName cannot be an empty string");
  });

  it("parses a single name", () => {
    expect(parseName("John")).toEqual({
      firstName: "John",
      middleName: undefined,
      lastName: undefined,
    });
  });

  it("parses first and last name", () => {
    expect(parseName("John Doe")).toEqual({
      firstName: "John",
      middleName: undefined,
      lastName: "Doe",
    });
  });

  it("parses first, middle, and last name", () => {
    expect(parseName("John Michael Doe")).toEqual({
      firstName: "John",
      middleName: "Michael",
      lastName: "Doe",
    });
  });

  it("parses multiple middle names", () => {
    expect(parseName("John Michael James Doe")).toEqual({
      firstName: "John",
      middleName: "Michael James",
      lastName: "Doe",
    });
  });

  it("handles extra whitespace", () => {
    expect(parseName("  John   Doe  ")).toEqual({
      firstName: "John",
      middleName: undefined,
      lastName: "Doe",
    });
  });

  it("handles tabs and newlines", () => {
    expect(parseName("John\tDoe\nSmith")).toEqual({
      firstName: "John",
      middleName: "Doe",
      lastName: "Smith",
    });
  });
});

describe("buildName", () => {
  it("builds name from first name only", () => {
    expect(buildName({ firstName: "John" })).toBe("John");
  });

  it("builds name from first and last name", () => {
    expect(buildName({ firstName: "John", lastName: "Doe" })).toBe("John Doe");
  });

  it("builds name with middle name", () => {
    expect(buildName({ firstName: "John", middleName: "Michael", lastName: "Doe" })).toBe("John Michael Doe");
  });

  it("handles empty middle name", () => {
    expect(buildName({ firstName: "John", middleName: "", lastName: "Doe" })).toBe("John Doe");
  });

  it("handles whitespace in parts", () => {
    expect(buildName({ firstName: "  John  ", middleName: "  Michael  ", lastName: "  Doe  " })).toBe("John Michael Doe");
  });

  it("handles undefined parts", () => {
    expect(buildName({ firstName: "John", middleName: undefined, lastName: "Doe" })).toBe("John Doe");
  });
});
import { describe, expect, test } from "vitest";

import { isAuthPath, isPublicPath } from "./index";

describe("isPublicPath", () => {
  test.each(["/", "/about", "/services", "/contact", "/privacy-policy", "/terms-and-conditions"])(
    "treats %s as public",
    (pathname) => {
      expect(isPublicPath(pathname)).toBe(true);
    }
  );

  test("treats dynamic audit report paths as public", () => {
    expect(isPublicPath("/audit/2e9f1c3a")).toBe(true);
  });

  test("does not treat private routes as public", () => {
    expect(isPublicPath("/dashboard")).toBe(false);
    expect(isPublicPath("/dashboard/companies")).toBe(false);
  });

  test("does not treat auth routes as public", () => {
    expect(isPublicPath("/login")).toBe(false);
  });
});

describe("isAuthPath", () => {
  test.each(["/login", "/register", "/forget-password", "/reset-password"])(
    "treats %s as auth",
    (pathname) => {
      expect(isAuthPath(pathname)).toBe(true);
    }
  );

  test("does not treat private or public routes as auth", () => {
    expect(isAuthPath("/dashboard")).toBe(false);
    expect(isAuthPath("/about")).toBe(false);
  });
});

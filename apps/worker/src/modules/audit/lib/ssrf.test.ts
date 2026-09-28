import { afterEach, describe, expect, it, vi } from "vitest";

import { assertPublicHttpUrl, isPrivateIp, SsrfError } from "./ssrf";

describe("isPrivateIp", () => {
  it.each([
    "127.0.0.1",
    "10.0.0.5",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.1.1",
    "169.254.169.254",
    "0.0.0.0",
    "224.0.0.1",
  ])("flags private IPv4 %s", (ip) => {
    expect(isPrivateIp(ip)).toBe(true);
  });

  it.each(["8.8.8.8", "1.1.1.1", "93.184.216.34"])(
    "allows public IPv4 %s",
    (ip) => {
      expect(isPrivateIp(ip)).toBe(false);
    }
  );

  it.each(["::1", "fe80::1", "fd00::1", "::ffff:127.0.0.1"])(
    "flags private IPv6 %s",
    (ip) => {
      expect(isPrivateIp(ip)).toBe(true);
    }
  );

  it("allows public IPv6", () => {
    expect(isPrivateIp("2606:4700:4700::1111")).toBe(false);
  });
});

describe("assertPublicHttpUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects non-http(s) protocols", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(assertPublicHttpUrl("file:///etc/passwd")).rejects.toThrow(
      SsrfError
    );
  });

  it("rejects literal private addresses", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(
      assertPublicHttpUrl("http://169.254.169.254/latest")
    ).rejects.toThrow(SsrfError);
    await expect(assertPublicHttpUrl("http://localhost/")).rejects.toThrow(
      SsrfError
    );
  });

  it("is a no-op under NODE_ENV=test", async () => {
    await expect(
      assertPublicHttpUrl("http://127.0.0.1/")
    ).resolves.toBeUndefined();
  });
});

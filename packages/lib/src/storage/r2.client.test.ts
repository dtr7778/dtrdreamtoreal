import { describe, expect, it } from "vitest";

import { createStorageSigner } from "./r2.client";

const signer = createStorageSigner({
  accountId: "account-123",
  bucketName: "files",
  accessKeyId: "AKIAEXAMPLE",
  secretAccessKey: "super-secret",
  uploadTtl: 300,
  downloadTtl: 3600,
});

describe("createStorageSigner", () => {
  it("builds an encoded object url", () => {
    expect(signer.buildObjectUrl("uploads/a b/c.pdf")).toBe(
      "https://account-123.r2.cloudflarestorage.com/files/uploads/a%20b/c.pdf"
    );
  });

  it("honours a custom endpoint", () => {
    const custom = createStorageSigner({
      accountId: "account-123",
      bucketName: "files",
      accessKeyId: "key",
      secretAccessKey: "secret",
    });

    expect(custom.buildObjectUrl("uploads/a.png")).toBe(
      "https://account-123.r2.cloudflarestorage.com/files/uploads/a.png"
    );
  });

  it("presigns a PUT with expiry and a signed content-type", async () => {
    const url = new URL(
      await signer.presignUpload({
        key: "uploads/profile_image/u1/avatar.png",
        contentType: "image/png",
      })
    );

    expect(url.origin).toBe("https://account-123.r2.cloudflarestorage.com");
    expect(url.pathname).toBe("/files/uploads/profile_image/u1/avatar.png");
    expect(url.searchParams.get("X-Amz-Expires")).toBe("300");
    expect(url.searchParams.get("X-Amz-Algorithm")).toBe("AWS4-HMAC-SHA256");
    expect(url.searchParams.get("X-Amz-Signature")).toBeTruthy();
    expect(url.searchParams.get("X-Amz-SignedHeaders")).toContain(
      "content-type"
    );
  });

  it("presigns a GET with the download TTL", async () => {
    const url = new URL(
      await signer.presignDownload({
        key: "uploads/profile_image/u1/avatar.png",
      })
    );

    expect(url.searchParams.get("X-Amz-Expires")).toBe("3600");
    expect(url.searchParams.get("X-Amz-Signature")).toBeTruthy();
  });
});

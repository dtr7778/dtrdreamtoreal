import { describe, expect, it } from "vitest";

import {
  getBlockedFileError,
  getFileExtension,
  getSanitizedFileKind,
  isBlockedFileName,
} from "./file-policy";

describe("getFileExtension", () => {
  it("returns the lowercased extension with its dot", () => {
    expect(getFileExtension("Report.PDF")).toBe(".pdf");
    expect(getFileExtension("archive.tar.gz")).toBe(".gz");
  });

  it("returns an empty string when there is no extension", () => {
    expect(getFileExtension("README")).toBe("");
    expect(getFileExtension(".env")).toBe("");
  });
});

describe("getBlockedFileError", () => {
  it("blocks executables and scripts regardless of case", () => {
    expect(getBlockedFileError("setup.exe")).toContain("zip it");
    expect(getBlockedFileError("deploy.SH")).toContain("zip it");
  });

  it("blocks names that Windows normalizes to an executable", () => {
    expect(isBlockedFileName("evil.exe.")).toBe(true);
    expect(isBlockedFileName("evil.exe ")).toBe(true);
    expect(isBlockedFileName("evil.exe. .")).toBe(true);
    expect(getSanitizedFileKind("page.html.")).toBe("html");
  });

  it("allows archives that wrap scripts", () => {
    expect(getBlockedFileError("scripts.zip")).toBeNull();
  });

  it("allows ordinary documents and images", () => {
    expect(getBlockedFileError("notes.txt")).toBeNull();
    expect(getBlockedFileError("photo.png")).toBeNull();
  });
});

describe("getSanitizedFileKind", () => {
  it("maps html and svg files to their sanitizer kind", () => {
    expect(getSanitizedFileKind("page.html")).toBe("html");
    expect(getSanitizedFileKind("page.HTM")).toBe("html");
    expect(getSanitizedFileKind("logo.svg")).toBe("svg");
  });

  it("returns null for other files", () => {
    expect(getSanitizedFileKind("doc.pdf")).toBeNull();
  });
});

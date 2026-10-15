export const MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export const BLOCKED_FILE_EXTENSIONS = [
  // Native executables and libraries
  ".exe",
  ".msi",
  ".dll",
  ".so",
  ".dylib",
  ".bin",
  ".run",
  ".app",
  ".com",
  ".scr",
  ".apk",
  ".jar",
  // Shell and scripting
  ".sh",
  ".bash",
  ".zsh",
  ".bat",
  ".cmd",
  ".ps1",
  ".vbs",
  ".wsf",
  ".js",
  ".mjs",
  ".py",
  ".rb",
  ".pl",
  ".php",
  // Other risky types
  ".lnk",
  ".reg",
] as const;

export const SANITIZED_HTML_EXTENSIONS = [".html", ".htm"] as const;
export const SANITIZED_SVG_EXTENSIONS = [".svg"] as const;

export type SanitizedFileKind = "html" | "svg";

export function getFileExtension(filename: string): string {
  // Windows silently drops trailing dots and spaces, so "evil.exe." is saved as "evil.exe".
  const normalized = filename.replace(/[. ]+$/, "");
  const dotIndex = normalized.lastIndexOf(".");
  if (dotIndex <= 0) return "";
  return normalized.slice(dotIndex).toLowerCase();
}

export function isBlockedFileName(filename: string): boolean {
  return (BLOCKED_FILE_EXTENSIONS as readonly string[]).includes(
    getFileExtension(filename)
  );
}

export function getBlockedFileError(filename: string): string | null {
  if (!isBlockedFileName(filename)) return null;

  return `"${filename}" is an executable or script file. Please zip it and upload the archive instead.`;
}

export function getSanitizedFileKind(
  filename: string
): SanitizedFileKind | null {
  const extension = getFileExtension(filename);
  if ((SANITIZED_HTML_EXTENSIONS as readonly string[]).includes(extension)) {
    return "html";
  }
  if ((SANITIZED_SVG_EXTENSIONS as readonly string[]).includes(extension)) {
    return "svg";
  }
  return null;
}

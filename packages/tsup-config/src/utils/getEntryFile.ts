import type { Entry } from "../types";

export function getEntryFile(entry: Entry, outDir: string): string {
  if (Array.isArray(entry)) {
    const mainEntry = entry[0];
    if (mainEntry) {
      const entryName = mainEntry.replace("src/", "").replace(".ts", ".js");
      return `${outDir}/${entryName}`;
    }
    return outDir;
  } else {
    // For Record<string, string>, use the first value
    const mainEntry = Object.values(entry)[0];
    if (mainEntry) {
      const entryName = mainEntry.replace("src/", "").replace(".ts", ".js");
      return `${outDir}/${entryName}`;
    }
    return outDir;
  }
}

import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { CopyDirectoryOptions } from "../types";

export function copyDirectory(
  source: string,
  destination: string,
  filter?: CopyDirectoryOptions["filter"],
): void {
  if (!existsSync(destination)) {
    mkdirSync(destination, { recursive: true });
  }

  const entries = readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(source, entry.name);
    const destPath = join(destination, entry.name);

    if (filter && !filter(srcPath, entry)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath, filter);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

export function copyAssets(assets: CopyDirectoryOptions[]): void {
  assets.forEach(({ source, destination, filter }) => {
    if (existsSync(source)) {
      try {
        copyDirectory(source, destination, filter);
        console.log(`✅ Copied assets from ${source} to ${destination}\n`);
      } catch (error) {
        console.warn(`⚠️ Failed to copy assets from ${source}:`, error);
      }
    } else {
      console.warn(`⚠️ Source directory not found: ${source}\n`);
    }
  });
}

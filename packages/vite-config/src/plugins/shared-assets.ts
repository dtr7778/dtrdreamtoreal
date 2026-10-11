import {
  createReadStream,
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import type { Plugin } from "vite";

const CONTENT_TYPES: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
};

function resolveAssetsDir(): string {
  const require = createRequire(import.meta.url);
  const packageJson = require.resolve("@workspace/tanstack-start/package.json");
  return path.join(path.dirname(packageJson), "assets");
}

function listAssetFiles(dir: string, base = ""): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const relative = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      return listAssetFiles(path.join(dir, entry.name), relative);
    }
    return entry.isFile() ? [relative] : [];
  });
}

export interface SharedAssetsOptions {
  assetsDir?: string;
}

export function sharedAssets(options: SharedAssetsOptions = {}): Plugin {
  const assetsDir = options.assetsDir ?? resolveAssetsDir();
  const files = listAssetFiles(assetsDir);

  return {
    name: "@workspace/vite-config:shared-assets",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || (req.method !== "GET" && req.method !== "HEAD")) {
          return next();
        }

        const relative = req.url.split("?")[0]!.replace(/^\//, "");
        const filePath = path.join(assetsDir, relative);
        if (!filePath.startsWith(`${assetsDir}${path.sep}`)) {
          return next();
        }
        if (!existsSync(filePath) || !statSync(filePath).isFile()) {
          return next();
        }

        res.setHeader(
          "Content-Type",
          CONTENT_TYPES[path.extname(filePath)] ?? "application/octet-stream"
        );
        res.setHeader("Cache-Control", "no-cache");
        if (req.method === "HEAD") {
          res.end();
          return;
        }
        createReadStream(filePath).pipe(res);
      });
    },
    generateBundle() {
      if (this.environment?.name !== "client") return;

      for (const file of files) {
        this.emitFile({
          type: "asset",
          fileName: file,
          source: readFileSync(path.join(assetsDir, file)),
        });
      }
    },
  };
}

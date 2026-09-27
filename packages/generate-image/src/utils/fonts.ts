import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

import type { SatoriOptions } from "satori";

export type SatoriFont = NonNullable<SatoriOptions["fonts"]>[number];

// Resolve from the running package's node_modules so this works both when the
// package is consumed as source by the backend and in its own test run.
const nodeRequire = createRequire(join(process.cwd(), "package.json"));

let fontsCache: SatoriFont[] | undefined;

function loadFont(fileName: string): Buffer {
  return readFileSync(
    nodeRequire.resolve(`@fontsource/inter/files/${fileName}`)
  );
}

/**
 * Inter is loaded once per process. The `.woff` files are used because Satori
 * does not support `.woff2`.
 */
export function getAuditReportFonts(): SatoriFont[] {
  fontsCache ??= [
    {
      name: "Inter",
      data: loadFont("inter-latin-400-normal.woff"),
      weight: 400,
      style: "normal",
    },
    {
      name: "Inter",
      data: loadFont("inter-latin-500-normal.woff"),
      weight: 500,
      style: "normal",
    },
    {
      name: "Inter",
      data: loadFont("inter-latin-600-normal.woff"),
      weight: 600,
      style: "normal",
    },
    {
      name: "Inter",
      data: loadFont("inter-latin-700-normal.woff"),
      weight: 700,
      style: "normal",
    },
    {
      name: "Inter",
      data: loadFont("inter-latin-800-normal.woff"),
      weight: 800,
      style: "normal",
    },
  ];

  return fontsCache;
}

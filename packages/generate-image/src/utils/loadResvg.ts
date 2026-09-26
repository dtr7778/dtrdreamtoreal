import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

import { initWasm } from "@resvg/resvg-wasm";

export async function loadResvg() {
  const nodeRequire = createRequire(join(process.cwd(), "package.json"));

  const wasmBuffer = readFileSync(
    nodeRequire.resolve("@resvg/resvg-wasm/index_bg.wasm")
  );

  await initWasm(wasmBuffer);
}

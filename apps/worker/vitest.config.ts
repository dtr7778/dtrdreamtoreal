import { resolve } from "node:path";

import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig, mergeConfig } from "vitest/config";

import { internalConfig } from "@workspace/vitest-config/internal";

export default defineConfig(
  mergeConfig(internalConfig, {
    plugins: [tsconfigPaths()],
    test: {
      passWithNoTests: true,
      alias: {
        "@": resolve(process.cwd(), "src"),
      },
    },
    resolve: {
      alias: {
        "@": resolve(process.cwd(), "src"),
      },
    },
  })
);

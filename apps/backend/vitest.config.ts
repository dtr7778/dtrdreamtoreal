import { resolve } from "node:path";

import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig, mergeConfig } from "vitest/config";

import { internalConfig } from "@workspace/vitest-config/internal";

export default defineConfig(
  mergeConfig(internalConfig, {
    plugins: [tsconfigPaths()],
    test: {
      setupFiles: ["./test/setup.ts"],
      alias: {
        "@": resolve(process.cwd(), "src"),
        "@test": resolve(process.cwd(), "test"),
      },
    },
    resolve: {
      alias: {
        "@": resolve(process.cwd(), "src"),
        "@test": resolve(process.cwd(), "test"),
      },
    },
  })
);

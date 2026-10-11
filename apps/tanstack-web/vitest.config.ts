import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig, mergeConfig } from "vitest/config";

import { uiConfig } from "@workspace/vitest-config/ui";

export default defineConfig(
  mergeConfig(uiConfig, {
    plugins: [tsconfigPaths(), react()],
    resolve: {
      alias: {
        "@": resolve(process.cwd(), "src"),
      },
    },
    test: {
      passWithNoTests: true,
      setupFiles: ["./tests/setup.ts"],
      alias: {
        "@": resolve(process.cwd(), "src"),
      },
    },
  })
);

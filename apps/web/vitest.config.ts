import { resolve } from "node:path";

import nextEnv from "@next/env";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig, mergeConfig } from "vitest/config";

import { uiConfig } from "@workspace/vitest-config/ui";

nextEnv.loadEnvConfig(process.cwd());

export default defineConfig(
  mergeConfig(uiConfig, {
    plugins: [tsconfigPaths(), react()],
    test: {
      setupFiles: ["./tests/setup.ts"],
      alias: {
        "server-only": resolve(
          process.cwd(),
          "./tests/__mocks__/serverOnly.mock.ts"
        ),
        "@": resolve(process.cwd(), "./"),
      },
    },
    resolve: {
      alias: {
        "server-only": resolve(
          process.cwd(),
          "./tests/__mocks__/serverOnly.mock.ts"
        ),
        "@": resolve(process.cwd(), "./"),
      },
    },
  })
);

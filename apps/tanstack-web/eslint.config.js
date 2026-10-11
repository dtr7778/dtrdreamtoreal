// @ts-check
import { configs } from "@workspace/eslint-config/tanstack-app";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...configs,
  {
    ignores: [
      "worker-configuration.d.ts",
      "vitest.config.ts",
      "eslint.config.js",
    ],
  },
];

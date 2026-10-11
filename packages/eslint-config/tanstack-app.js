import { tanstackConfig } from "@tanstack/eslint-config";

import { config as baseConfig } from "./base.js";

/**
 * Shared ESLint configuration for TanStack apps in the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const configs = [
  ...baseConfig,
  ...tanstackConfig,
  {
    rules: {
      "import/no-cycle": "off",
      "import/order": "off",
      "sort-imports": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/require-await": "off",
      "pnpm/json-enforce-catalog": "off",
    },
    ignores: ["eslint.config.js"],
  },
];

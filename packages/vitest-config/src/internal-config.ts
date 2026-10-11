import { defineProject, mergeConfig } from "vitest/config";

import { baseConfig } from "./base-config";

export const internalConfig = mergeConfig(
  baseConfig,
  defineProject({
    test: {
      environment: "node",
    },
  })
);

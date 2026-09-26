import { defineConfig, mergeConfig } from "vitest/config";

import { internalConfig } from "@workspace/vitest-config/internal";

export default defineConfig(mergeConfig(internalConfig, {}));

import { defineConfig } from "vitest/config";

export const baseConfig = defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    include: [
      "tests/**/*.{test,spec}.{ts,tsx}",
      "src/**/*.{test,spec}.{ts,tsx}",
      "**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: ["node_modules", "dist", ".next", "**/*.d.ts"],
    coverage: {
      provider: "istanbul",
      reporter: ["html", "json"],
      reportsDirectory: "./coverage",
      exclude: [
        "**/tests/**",
        "**/*.test.ts",
        "**/vitest.setup.ts",
        "**/__mocks__/**",
        "**/node_modules/**",
        "**/dist/**",
        "**/coverage/**",
      ],
    },
  },
});

import { expressEslintConfig } from "@workspace/eslint-config/express-js";

/** @type {import("eslint").Linter.Config} */
export default [
  ...expressEslintConfig,
  {
    ignores: ["dist"],
    files: ["src/**/*.ts"],
  },
];

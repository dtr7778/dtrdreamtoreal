import { resolve } from "node:path";

import { config } from "dotenv";

import { createBuildConfig, OutputOptions } from "@workspace/tsup-config";

import pkg from "./package.json";

config({
  path: [resolve(process.cwd(), ".env")],
});

const options: OutputOptions = createBuildConfig({
  isDev: process.env.NODE_ENV === "development",
  entry: ["src/worker.ts"],
  format: ["cjs"],
  outDir: "dist",
  name: "Backend Worker",
  target: "node24",
  tsconfig: "./tsconfig.json",
  ignoreWatch: ["node_modules", "dist", "test", "./src/**/*.test.ts"],
  dependencies: pkg.dependencies,
  internalScope: "@workspace",
  autoRestart: true,
  aliases: {
    "@": resolve(process.cwd(), "src"),
  },
  onBuildSuccess: () => {
    console.log("🎉 worker build completed!\n");
  },
});

export default options;
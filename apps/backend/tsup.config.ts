import { join, resolve } from "node:path";

import { config } from "dotenv";

import { createBuildConfig, OutputOptions } from "@workspace/tsup-config";

import pkg from "./package.json";

config({
  path: [join(process.cwd(), ".env")],
});

const options: OutputOptions = createBuildConfig({
  isDev: process.env.NODE_ENV === "development",
  entry: ["src/index.ts"],
  format: ["cjs"],
  outDir: "dist",
  name: "Backend",
  target: "node24",
  tsconfig: "./tsconfig.json",
  copyAssets: [
    {
      source: join(process.cwd(), "public"),
      destination: join(process.cwd(), "dist", "public"),
    },
  ],
  watch: ["src"],
  ignoreWatch: ["node_modules", "dist", "test", "./src/**/*.test.ts"],
  dependencies: pkg.dependencies,
  internalScope: "@workspace",
  autoRestart: true,
  aliases: {
    "@": resolve(process.cwd(), "src"),
  },
  onBuildSuccess: () => {
    console.log("🎉 build completed!\n");
  },
});

export default options;

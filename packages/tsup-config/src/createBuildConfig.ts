import { defineConfig } from "tsup";
import { resolve } from "node:path";
import {
  copyAssets,
  getEntryFile,
  getPackageDeps,
  setupGracefulShutdown,
  startServer,
} from "./utils";
import { BuildConfigOptions } from "./types";

export function createBuildConfig(
  userOptions: BuildConfigOptions,
): ReturnType<typeof defineConfig> {
  const {
    entry,
    isDev,
    outDir = "dist",
    target = "node24",
    aliases = { "@": resolve(process.cwd(), "src") },
    dependencies,
    internalScope = "@movingaccelerator",
    copyAssets: assetsToCopy = [],
    autoRestart = true,
    onBuildSuccess,
    ...restOptions
  } = userOptions;

  // Parse dependencies if package.json is provided
  let internalPackages: string[] = [];
  let externalPackages: string[] = [];

  if (dependencies) {
    const deps = getPackageDeps(dependencies, internalScope);
    internalPackages = deps.internalPackages;
    externalPackages = deps.externalPackages;
  }

  // Setup graceful shutdown for dev mode
  if (isDev && autoRestart) {
    setupGracefulShutdown();
  }

  return defineConfig({
    entry,
    outDir,
    target,
    clean: !isDev,
    dts: false,
    sourcemap: true,
    splitting: false,
    minify: !isDev,
    shims: false,
    watch: isDev,
    // treeshake: !isDev,
    // skipNodeModulesBundle: true,
    external: externalPackages,
    noExternal: internalPackages,
    esbuildOptions(options) {
      options.alias = aliases;
    },
    onSuccess: async () => {
      console.log("✅ Build complete!\n");

      // Copy assets if specified
      if (assetsToCopy.length > 0) {
        copyAssets(assetsToCopy);
      }

      // Run custom success callback
      if (onBuildSuccess) {
        await onBuildSuccess();
      }

      // Auto-restart server in dev mode
      if (isDev && autoRestart) {
        const entryFile = getEntryFile(entry, outDir);
        startServer(entryFile);
      }
    },
    ...restOptions,
  });
}

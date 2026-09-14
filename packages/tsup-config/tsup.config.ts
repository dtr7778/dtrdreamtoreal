import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  clean: true,

  // emit both ESM and CJS
  format: ["esm", "cjs"],

  dts: {
    entry: "src/index.ts",
  },

  sourcemap: false,
  splitting: false,
  shims: false,
  treeshake: true,
  target: "node24",
  outDir: "dist",

  external: ["tsup"],

  esbuildOptions(options) {
    options.platform = "node";
  },
});

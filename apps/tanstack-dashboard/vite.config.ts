import { cloudflare } from "@cloudflare/vite-plugin";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { serwistClient, sharedAssets } from "@workspace/vite-config/plugins";

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  server: {
    port: 3100,
    forwardConsole: true,
  },
  preview: {
    port: 4273,
  },
  plugins: [
    devtools(),
    cloudflare({
      viteEnvironment: { name: "ssr" },
      persistState: { path: "../../.wrangler" },
      auxiliaryWorkers: [
        { configPath: "../hono-backend/wrangler.jsonc", devOnly: true },
      ],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
    sharedAssets(),
    serwistClient({
      swSrc: "src/sw.ts",
      swDest: "sw.js",
      globDirectory: "dist/client",
      injectionPoint: "self.__SW_MANIFEST",
      rollupFormat: "iife",
    }),
  ],
});

export default config;

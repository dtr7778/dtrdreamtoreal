import { cloudflare } from "@cloudflare/vite-plugin";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import type { Plugin } from "vite";

import { sharedAssets } from "@workspace/vite-config/plugins";

function tanstackVirtualUrlShim(): Plugin {
  return {
    name: "tanstack-start:virtual-url-shim",
    enforce: "pre",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        // Check if the request matches the broken bare virtual URL
        if (req.url?.startsWith("/@id/virtual:tanstack-")) {
          // Rewrite it to the encoded format that Vite 8 expects
          req.url = req.url.replace("/@id/virtual:", "/@id/__x00__virtual:");
        }
        next();
      });
    },
  };
}

const config = defineConfig(() => {
  return {
    resolve: { tsconfigPaths: true },
    server: {
      port: 3000,
      forwardConsole: true,
    },
    preview: {
      port: 4173,
    },
    plugins: [
      tanstackVirtualUrlShim(),
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
    ],
  };
});

export default config;

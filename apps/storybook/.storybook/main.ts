import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

const config: StorybookConfig = {
  stories: [
    "../../../packages/ui/**/*.stories.@(ts|tsx)",
    "../../web/**/*.stories.@(ts|tsx)",
    "../src/**/*.mdx",
    "../src/**/*.stories.@(ts|tsx)",
  ],
  addons: [
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-vitest"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-docs"),
  ],
  framework: getAbsolutePath("@storybook/react-vite"),
  viteFinal: async (config) => {
    return mergeConfig(config, {
      server: {
        fs: {
          allow: ["../../../"],
        },
      },
      resolve: {
        alias: {
          "@workspace/ui": resolve(
            dirname(fileURLToPath(import.meta.url)),
            "../../../packages/ui/src"
          ),
          "@": resolve(
            dirname(fileURLToPath(import.meta.url)),
            "../../../apps/web"
          ),
          "next/image": resolve(
            dirname(fileURLToPath(import.meta.url)),
            "./mocks/next-image.tsx"
          ),
        },
      },
    });
  },
};

export default config;

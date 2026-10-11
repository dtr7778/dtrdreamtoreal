import { build, createApi, createContext, dev, main } from "@serwist/vite";
import type { Plugin, ResolvedConfig } from "vite";

type ConfigResolvedHook =
  | ((config: ResolvedConfig) => unknown)
  | { handler: (config: ResolvedConfig) => unknown }
  | undefined;

async function runConfigResolved(plugin: Plugin, config: ResolvedConfig) {
  const hook = plugin.configResolved as ConfigResolvedHook;
  if (!hook) return;
  if (typeof hook === "function") await hook(config);
  else await hook.handler(config);
}

export function serwistClient(
  userOptions: Parameters<typeof createContext>[0]
): Plugin[] {
  const ctx = createContext(userOptions, undefined);
  const api = createApi(ctx);
  const mainPlugin = main(ctx, api);
  const buildPlugin = build(ctx, api);
  const devPlugin = dev(ctx, api);

  const clientBuild: Plugin = {
    ...buildPlugin,
    applyToEnvironment: (environment) => environment.name === "client",
    async closeBundle() {
      await runConfigResolved(mainPlugin, this.environment.config);
      await api.generateSW();
    },
  };

  return [mainPlugin, clientBuild, devPlugin];
}

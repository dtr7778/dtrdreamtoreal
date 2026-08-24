import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { SimpleCsrfProtectionLinkPlugin } from "@orpc/client/plugins";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

import { router } from "./orpc.router";

declare global {
  var $client: RouterClient<typeof router> | undefined;
}

const link = new RPCLink({
  url: () => {
    if (typeof window === "undefined") {
      throw new Error("RPCLink is not allowed on the server side.");
    }

    return `${window.location.origin}/orpc`;
  },
  plugins: [new SimpleCsrfProtectionLinkPlugin()],
});

/**
 * Fallback to client-side client if server-side client is not available.
 */
export const orpcClient: RouterClient<typeof router> =
  globalThis.$client ?? createORPCClient(link);

export const orpcTQClient = createTanstackQueryUtils(orpcClient);

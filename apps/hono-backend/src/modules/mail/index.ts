import { createRouter } from "@workspace/server-core";

import type { ApiVariables } from "@/types";

import * as handlers from "./mail.handlers";
import * as routes from "./mail.routes";

const router = createRouter<Env, ApiVariables>()
  .openapi(routes.inboundMailRoute, handlers.inboundMailHandler)
  .openapi(routes.outboundMailRoute, handlers.outboundMailHandler)
  .openapi(routes.emailEventRoute, handlers.emailEventHandler);

export default router;

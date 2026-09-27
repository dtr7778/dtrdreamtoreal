import { implement } from "@orpc/server";

import { errorMiddleware } from "@/server/middleware/error.middleware";
import { ORPCContext } from "@/types/orpc.types";

import { auditContract } from "./audit.contract";

export const auditImpl = implement(auditContract)
  .$context<ORPCContext>()
  .use(errorMiddleware);

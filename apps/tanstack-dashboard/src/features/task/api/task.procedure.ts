import { authMiddleware } from "#/server/middleware/auth.middleware";
import { errorMiddleware } from "#/server/middleware/error.middleware";
import type { ORPCContext } from "#/types/orpc.types";
import { implement } from "@orpc/server";

import { taskContract } from "./task.contract";

export const taskImpl = implement(taskContract)
  .$context<ORPCContext>()
  .use(authMiddleware)
  .use(errorMiddleware);

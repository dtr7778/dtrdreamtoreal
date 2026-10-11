import type {
  AnyContractRouter,
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from "@orpc/contract";

import type { AuthSession, AuthUser } from "@workspace/auth";
import type { DatabaseType } from "@workspace/drizzle/client";
import type { PermissionType, RoleType } from "@workspace/lib/types";

export interface ORPCContext {
  reqHeaders: Readonly<Headers>;
  db: DatabaseType;
  user: AuthUser | null;
  session: AuthSession | null;
  permissions: Array<PermissionType>;
  roles: Array<RoleType>;
}

export type InferContractRouterType<T extends AnyContractRouter> = {
  input: InferContractRouterInputs<T>;
  output: InferContractRouterOutputs<T>;
};

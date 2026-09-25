import type { NextRequest } from "next/server";

import type {
  AnyContractRouter,
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from "@orpc/contract";

import type { DatabaseType } from "@workspace/drizzle/types";
import { ExtendedRedis } from "@workspace/lib/redis/upstash";
import type { ServerSupabaseClient } from "@workspace/lib/supabase/server-client";
import type { PermissionType, RoleType } from "@workspace/lib/types";

import type { AuthSession, AuthUser } from "@/types";

export interface ORPCContext {
  reqHeaders: Readonly<NextRequest["headers"]>;
  db: Readonly<DatabaseType>;
  redisClient: ExtendedRedis;
  user: AuthUser | null;
  session: AuthSession | null;
  roles: Array<RoleType> | null;
  permissions: Array<PermissionType> | null;
  supabaseClient: ServerSupabaseClient;
}

export type InferContractRouterType<T extends AnyContractRouter> = {
  input: InferContractRouterInputs<T>;
  output: InferContractRouterOutputs<T>;
};

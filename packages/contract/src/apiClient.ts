import type {
  InfiniteData,
  QueryKey,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import z from "zod";

import type { ContractOutputs } from "@workspace/lib/types";

import { contracts } from "./contracts";
import { isContract } from "./isContract";
import { serializePath, serializeQuery } from "./serializer";
import { ContractNode } from "./types";

async function requestContract<C extends ContractOutputs>(
  axiosInstance: AxiosInstance,
  contract: C,
  input: z.infer<C["input"]> | undefined,
  config?: AxiosRequestConfig
): Promise<z.infer<C["output"]>> {
  const { body, params, query } = contract.input.parse({
    ...input,
    query: serializeQuery(input?.query as Record<string, unknown>),
  });

  const response = await axiosInstance.request<z.infer<C["output"]>>({
    ...config,
    url: serializePath(contract.path, params),
    method: contract.method,
    params: serializeQuery(query as Record<string, unknown>),
    data: body,
  });

  return contract.output.parse(response.data) as z.infer<C["output"]>;
}

export interface CallApiOptions<C extends ContractOutputs> {
  input: z.infer<C["input"]>;
  config?: AxiosRequestConfig;
}

export interface QueryOptionsIn<
  C extends ContractOutputs,
  TSelectData = z.infer<C["output"]>,
> extends Omit<
  UseQueryOptions<z.infer<C["output"]>, Error, TSelectData>,
  "queryKey" | "queryFn"
> {
  input: z.infer<C["input"]>;
  queryKey?: QueryKey;
  axiosConfig?: AxiosRequestConfig;
}

export interface InfiniteKeyOptions<C extends ContractOutputs, TPageParam> {
  /** Maps a page param to the contract input for that page (e.g. sets `query.cursor`). */
  input: (pageParam: TPageParam) => z.infer<C["input"]>;
  initialPageParam: TPageParam;
}

export interface InfiniteOptionsIn<
  C extends ContractOutputs,
  TPageParam,
  TSelectData = InfiniteData<z.infer<C["output"]>, TPageParam>,
> extends Omit<
  UseInfiniteQueryOptions<
    z.infer<C["output"]>,
    Error,
    TSelectData,
    QueryKey,
    TPageParam
  >,
  "queryKey" | "queryFn"
> {
  input: (pageParam: TPageParam) => z.infer<C["input"]>;
  queryKey?: QueryKey;
  axiosConfig?: AxiosRequestConfig;
}

export interface MutationOptionsIn<
  C extends ContractOutputs,
  TContext = unknown,
> extends Omit<
  UseMutationOptions<
    z.infer<C["output"]>,
    Error,
    z.infer<C["input"]>,
    TContext
  >,
  "mutationKey" | "mutationFn"
> {
  mutationKey?: QueryKey;
  axiosConfig?: AxiosRequestConfig;
}

export class ProcedureApiUtils<C extends ContractOutputs> {
  constructor(
    private readonly path: string[],
    private readonly contract: C,
    private readonly axiosInstance: AxiosInstance
  ) {}

  private buildOperationKey(
    path: string[],
    type: "query" | "infinite" | "mutation",
    input?: unknown
  ): QueryKey {
    return type === "mutation"
      ? ([path, { type }] as QueryKey)
      : ([path, { type, input: input ?? {} }] as QueryKey);
  }

  callApi(options: CallApiOptions<C>): Promise<z.infer<C["output"]>> {
    return requestContract(
      this.axiosInstance,
      this.contract,
      options.input,
      options.config
    );
  }

  queryKey(input: z.infer<C["input"]>): QueryKey {
    return this.buildOperationKey(this.path, "query", input);
  }

  queryOptions<TSelectData = z.infer<C["output"]>>(
    options: QueryOptionsIn<C, TSelectData>
  ): UseQueryOptions<z.infer<C["output"]>, Error, TSelectData> {
    const { input, axiosConfig, queryKey, ...rest } = options;

    return {
      ...rest,
      queryKey: queryKey ?? this.queryKey(input),
      queryFn: () =>
        requestContract(this.axiosInstance, this.contract, input, axiosConfig),
    } as UseQueryOptions<z.infer<C["output"]>, Error, TSelectData>;
  }

  infiniteKey<TPageParam>(
    options: InfiniteKeyOptions<C, TPageParam>
  ): QueryKey {
    return this.buildOperationKey(
      this.path,
      "infinite",
      options.input(options.initialPageParam)
    );
  }

  infiniteOptions<
    TPageParam,
    TSelectData = InfiniteData<z.infer<C["output"]>, TPageParam>,
  >(
    options: InfiniteOptionsIn<C, TPageParam, TSelectData>
  ): UseInfiniteQueryOptions<
    z.infer<C["output"]>,
    Error,
    TSelectData,
    QueryKey,
    TPageParam
  > {
    const { input, axiosConfig, queryKey, ...rest } = options;

    return {
      ...rest,
      queryKey:
        queryKey ??
        this.infiniteKey({ input, initialPageParam: rest.initialPageParam }),
      queryFn: ({ pageParam }) =>
        requestContract(
          this.axiosInstance,
          this.contract,
          input(pageParam as TPageParam),
          axiosConfig
        ),
    } as UseInfiniteQueryOptions<
      z.infer<C["output"]>,
      Error,
      TSelectData,
      QueryKey,
      TPageParam
    >;
  }

  mutationKey(): QueryKey {
    return this.buildOperationKey(this.path, "mutation");
  }

  mutationOptions<TContext = unknown>(
    options: MutationOptionsIn<C, TContext> = {}
  ): UseMutationOptions<
    z.infer<C["output"]>,
    Error,
    z.infer<C["input"]>,
    TContext
  > {
    const { mutationKey, axiosConfig, ...rest } = options;

    return {
      ...rest,
      mutationKey: mutationKey ?? this.mutationKey(),
      mutationFn: (input) =>
        requestContract(this.axiosInstance, this.contract, input, axiosConfig),
    } as UseMutationOptions<
      z.infer<C["output"]>,
      Error,
      z.infer<C["input"]>,
      TContext
    >;
  }
}

export type ApiClient<T extends ContractNode> = T extends ContractOutputs
  ? ProcedureApiUtils<T>
  : { [K in keyof T]: T[K] extends ContractNode ? ApiClient<T[K]> : never };

export interface CreateApiClientOptions {
  axios: AxiosInstance;
}

function createApiClientInternal(
  node: ContractNode,
  path: string[],
  options: CreateApiClientOptions
): unknown {
  if (isContract(node)) {
    return new ProcedureApiUtils(path, node, options.axios);
  }

  const cache = new Map<string, unknown>();

  return new Proxy(node as Record<string, ContractNode>, {
    get(target, prop, receiver) {
      if (typeof prop !== "string") {
        return Reflect.get(target, prop, receiver);
      }

      if (cache.has(prop)) {
        return cache.get(prop);
      }

      const child = target[prop];
      if (child === undefined) {
        return undefined;
      }

      const result = createApiClientInternal(child, [...path, prop], options);
      cache.set(prop, result);
      return result;
    },
  });
}

export function createApiClient(
  options: CreateApiClientOptions
): ApiClient<typeof contracts> {
  return createApiClientInternal(contracts, [], options) as ApiClient<
    typeof contracts
  >;
}

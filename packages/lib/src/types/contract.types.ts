import type z from "zod";

import { HTTPMethods } from ".";

export interface ContractMeta {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  deprecated?: boolean;
}

export type ContractInput = {
  body?: z.ZodObject<z.ZodRawShape>;
  params?: z.ZodObject<z.ZodRawShape>;
  query?: z.ZodObject<z.ZodRawShape>;
};
export type ContractOutput = z.ZodType;

export interface ContractInputs<
  TInput extends ContractInput = ContractInput,
  TOutput extends ContractOutput = ContractOutput,
> {
  method: HTTPMethods;
  path: string;
  input: TInput;
  output: TOutput;
  meta?: ContractMeta;
}

export interface ContractOutputs<
  TInput extends ContractInput = ContractInput,
  TOutput extends ContractOutput = ContractOutput,
> {
  method: HTTPMethods;
  path: string;
  input: z.ZodObject<TInput>;
  output: TOutput;
  meta?: ContractMeta;
}

export type InferContractType<C extends ContractOutputs> = {
  input: z.infer<C["input"]>;
  output: z.infer<C["output"]>;
};

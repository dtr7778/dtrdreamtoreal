import z from "zod";

import type {
  ContractInput,
  ContractInputs,
  ContractOutput,
  ContractOutputs,
} from "@workspace/lib/types";

export function createContract<
  TInput extends ContractInput,
  TOutput extends ContractOutput,
>({
  input,
  ...rest
}: ContractInputs<TInput, TOutput>): ContractOutputs<TInput, TOutput> {
  return {
    ...rest,
    input: z.object(input),
  };
}

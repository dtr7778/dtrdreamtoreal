import { ContractOutputs } from "@workspace/lib/types";

export type ContractNode = ContractOutputs | { [key: string]: ContractNode };

import type { ContractOutputs } from "@workspace/lib/types";

export function isContract(contract: unknown): contract is ContractOutputs {
  return !!(
    contract &&
    typeof contract === "object" &&
    "method" in contract &&
    "path" in contract &&
    "input" in contract &&
    "output" in contract
  );
}

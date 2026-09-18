import { userContract, type UserContractType } from "./user.contract";

export type ContractsType = {
  user: UserContractType;
};
export const contracts = {
  user: userContract,
};

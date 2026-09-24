import { mailContract, type MailContractType } from "./mail.contract";
import {
  siteAuditContract,
  type SiteAuditContractType,
} from "./siteAudit.contract";
import { userContract, type UserContractType } from "./user.contract";

export type ContractsType = {
  user: UserContractType;
  siteAudit: SiteAuditContractType;
  mail: MailContractType;
};

export const contracts = {
  user: userContract,
  siteAudit: siteAuditContract,
  mail: mailContract,
};

import { auditContract, type AuditContractType } from "./audit.contract";
import {
  siteAuditContract,
  type SiteAuditContractType,
} from "./siteAudit.contract";
import { userContract, type UserContractType } from "./user.contract";

export type ContractsType = {
  user: UserContractType;
  siteAudit: SiteAuditContractType;
  audit: AuditContractType;
};

export const contracts = {
  user: userContract,
  siteAudit: siteAuditContract,
  audit: auditContract,
};

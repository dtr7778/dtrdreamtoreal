import { auditContract, type AuditContractType } from "./audit.contract";
import { mailContract, type MailContractType } from "./mail.contract";
import {
  siteAuditContract,
  type SiteAuditContractType,
} from "./siteAudit.contract";
import { userContract, type UserContractType } from "./user.contract";

export type ContractsType = {
  user: UserContractType;
  siteAudit: SiteAuditContractType;
  audit: AuditContractType;
  mail: MailContractType;
};

export const contracts = {
  user: userContract,
  siteAudit: siteAuditContract,
  audit: auditContract,
  mail: mailContract,
};

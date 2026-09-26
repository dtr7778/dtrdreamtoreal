import type { CompanyCreateType } from "@/features/company/company.schema";

export type CompanyCreateDraft = {
  step: string;
  values: CompanyCreateType;
};

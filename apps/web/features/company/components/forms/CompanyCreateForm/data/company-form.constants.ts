import { type Variants } from "motion/react";

import { CompanyCreateType } from "@/features/company/company.schema";

export type CompanyFormStep = {
  value: string;
  title: string;
  description: string;
  fields: Array<keyof CompanyCreateType>;
};

export const companyFormSteps: Array<CompanyFormStep> = [
  {
    value: "details",
    title: "Company Details",
    description: "Enter company information",
    fields: [
      "name",
      "legalName",
      "website",
      "industry",
      "employSize",
      "email",
      "phone",
      "socialMedia",
      "addresses",
    ],
  },
  {
    value: "brief",
    title: "Briefing",
    description: "Enter company briefing",
    fields: ["context"],
  },
  {
    value: "employee",
    title: "Employee Details",
    description: "Enter company employee information",
    fields: ["employees"],
  },
];

export const formAnimationVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      ease: "easeInOut",
      duration: 0.5,
    },
  },
};

export function createEmptyEmployee(): CompanyCreateType["employees"][number] {
  return {
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    jobTitle: "",
    website: "",
    addresses: [],
    socialMedia: [],
  };
}

export const COMPANY_CREATE_DEFAULTS: CompanyCreateType = {
  name: "",
  legalName: "",
  email: "",
  phone: "",
  employSize: "",
  industry: "",
  website: "",
  context: {},
  addresses: [
    {
      type: "work",
      streetLine1: "",
      city: "",
      zipCode: "",
      state: "",
      country: "",
      notes: "",
      isPrimary: true,
    },
  ],
  socialMedia: [
    {
      type: "company",
      platform: "facebook",
      url: "",
      username: "",
      displayName: "",
      notes: "",
    },
  ],
  employees: [createEmptyEmployee()],
};

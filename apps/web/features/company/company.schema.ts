import z from "zod";

import {
  AddressTypeEnumSchema,
  SocialMediaPlatfromTypeEnumSchema,
  SocialMediaTypeEnumSchema,
} from "@workspace/drizzle/zod-db-enums";
import { emptyStrSchema } from "@workspace/lib/zod";

export const socialMediaCreateSchema = z.object({
  type: SocialMediaTypeEnumSchema,
  platform: SocialMediaPlatfromTypeEnumSchema,
  username: z
    .string()
    .min(1, "Username is required")
    .max(255, "Username is too long"),
  displayName: emptyStrSchema.optional(),
  url: z.url(),
  notes: emptyStrSchema.optional(),
});
export type SocialMediaCreateType = z.infer<typeof socialMediaCreateSchema>;

export const addressCreateSchema = z.object({
  type: AddressTypeEnumSchema,
  streetLine1: z.string().min(1, "Street line 1 is required"),
  streetLine2: emptyStrSchema.optional(),
  city: z.string().min(1, "City is required").max(255, "City is too long"),
  state: emptyStrSchema.optional(),
  zipCode: z
    .string()
    .min(1, "Zip code is required")
    .max(10, "Zip code is too long"),
  country: z
    .string()
    .min(1, "Country is required")
    .max(100, "Country is too long"),
  isPrimary: z.boolean(),
  latitude: emptyStrSchema.optional(),
  longitude: emptyStrSchema.optional(),
  notes: emptyStrSchema.optional(),
});
export type AddressCreateType = z.infer<typeof addressCreateSchema>;

export const employeeCreateSchema = z.object({
  companyId: z.uuid("Please select a company"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(255, "First name is too long"),
  middleName: emptyStrSchema.optional(),
  lastName: emptyStrSchema.optional(),
  email: emptyStrSchema.pipe(z.email().optional()).optional(),
  phone: emptyStrSchema.optional(),
  jobTitle: emptyStrSchema.optional(),
  department: emptyStrSchema.optional(),
  website: emptyStrSchema.pipe(z.url().optional()).optional(),
  socialMedia: z.array(socialMediaCreateSchema),
  addresses: z.array(addressCreateSchema),
});
export type EmployeeCreateType = z.infer<typeof employeeCreateSchema>;

export const employeeUpdateSchema = employeeCreateSchema
  .omit({ companyId: true })
  .partial();
export type EmployeeUpdateType = z.infer<typeof employeeUpdateSchema>;

export const companyCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Company name is required")
    .max(255, "Company name is too long"),
  legalName: z.string().max(255, "Legal name is too long").optional(),
  website: emptyStrSchema.pipe(z.url().optional()).optional(),
  industry: emptyStrSchema.optional(),
  employSize: emptyStrSchema.optional(),
  email: emptyStrSchema.pipe(z.email().optional()).optional(),
  phone: emptyStrSchema.optional(),
  description: emptyStrSchema.optional(),
  employees: z.array(employeeCreateSchema.omit({ companyId: true })),
  socialMedia: z.array(socialMediaCreateSchema),
  addresses: z.array(addressCreateSchema),
});
export type CompanyCreateType = z.infer<typeof companyCreateSchema>;

export const companyUpdateSchema = companyCreateSchema.partial().omit({
  employees: true,
});
export type CompanyUpdateType = z.infer<typeof companyUpdateSchema>;

export const companyThreadCreateSchema = z.object({
  companyId: z.uuid(),
  subject: z.string().min(1, "Subject is required"),
});
export type CompanyThreadCreateType = z.infer<typeof companyThreadCreateSchema>;

import z from "zod";

import {
  selectAddressSchema,
  selectCompanySchema,
  selectEmployeeSchema,
  selectSocialMediaSchema,
} from "@workspace/drizzle/schemas";
import {
  apiOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/zod";

import { userProfileSchema } from "@/features/user/user.api-schema";
import { InferContractRouterType } from "@/types/orpc.types";

import { employeeCreateSchema, employeeUpdateSchema } from "../company.schema";
import { companyBaseContract } from "./company.base-contract";

const tags = ["Company", "Employee"] as const;

const listEmployeeContract = companyBaseContract
  .route({
    path: "/companies/employees/list",
    description: "List of employees",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectEmployeeSchema>({
      searchFields: ["firstName", "lastName", "email"],
      orderFields: ["createdAt"],
      filter: z.object({
        companyId: z.uuid().optional(),
        createdAt: z
          .object({
            from: z.date().describe("Created at from date").optional(),
            to: z.date().describe("Created at to date").optional(),
          })
          .optional(),
      }),
    })
  )
  .output(
    apiOutputZodSchema(
      paginateOutputZodSchema(
        selectEmployeeSchema
          .pick({
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
            phone: true,
            jobTitle: true,
            department: true,
            website: true,
            createdAt: true,
            updatedAt: true,
          })
          .extend({
            company: selectCompanySchema.pick({ id: true, name: true }),
          })
      )
    )
  );
export type ListEmployeeContractType = InferContractRouterType<
  typeof listEmployeeContract
>;

const employeeDetailsContract = companyBaseContract
  .route({
    path: "/companies/employees/details",
    description: "Employee details",
    tags,
  })
  .input(z.object({ employeeId: z.uuid() }))
  .output(
    apiOutputZodSchema(
      selectEmployeeSchema
        .pick({
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          email: true,
          phone: true,
          jobTitle: true,
          department: true,
          website: true,
          createdAt: true,
          updatedAt: true,
        })
        .extend({
          createdByUser: userProfileSchema,
          company: selectCompanySchema.pick({ id: true, name: true }),
          addresses: z.array(
            selectAddressSchema.extend({ isPrimary: z.boolean() })
          ),
          socialMedia: z.array(selectSocialMediaSchema),
        })
    )
  );
export type EmployeeDetailsContractType = InferContractRouterType<
  typeof employeeDetailsContract
>;

const employeeCreateContract = companyBaseContract
  .route({
    path: "/companies/employees/create",
    description: "Create an employee",
    tags,
  })
  .input(employeeCreateSchema)
  .output(apiOutputZodSchema(selectEmployeeSchema));
export type EmployeeCreateContractType = InferContractRouterType<
  typeof employeeCreateContract
>;

const employeeUpdateContract = companyBaseContract
  .route({
    path: "/companies/employees/update",
    description: "Update an employee",
    tags,
  })
  .input(employeeUpdateSchema.extend({ employeeId: z.uuid() }))
  .output(apiOutputZodSchema(selectEmployeeSchema));
export type EmployeeUpdateContractType = InferContractRouterType<
  typeof employeeUpdateContract
>;

const employeeDeleteContract = companyBaseContract
  .route({
    path: "/companies/employees/delete",
    description: "Delete an employee",
    tags,
  })
  .input(z.object({ employeeIds: z.array(z.uuid()).min(1) }))
  .output(apiOutputZodSchema(z.null()));
export type EmployeeDeleteContractType = InferContractRouterType<
  typeof employeeDeleteContract
>;

export const employeeContract = {
  list: listEmployeeContract,
  details: employeeDetailsContract,
  create: employeeCreateContract,
  update: employeeUpdateContract,
  delete: employeeDeleteContract,
};

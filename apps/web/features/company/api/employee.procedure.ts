import { ORPCError } from "@orpc/client";
import { eq, inArray } from "drizzle-orm";

import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  AddressTable,
  CompanyTable,
  EmployeeAddressTable,
  EmployeeDataModel,
  EmployeeSocialTable,
  EmployeeTable,
  InsertAddress,
  InsertEmployee,
  InsertEmployeeAddress,
  InsertEmployeeSocial,
  InsertSocialMedia,
  RoleTable,
  SocialMediaTable,
  UpdateEmployee,
  UserRoleTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import { apiResponse } from "@workspace/lib/utils";

import { API_MESSAGES } from "@/constants/apiMessage";
import { userProfileColumns } from "@/features/user/user.api-schema";
import { userPermissionMiddleware } from "@/server/middleware/auth.middleware";

import { companyImpl } from "./company.procedure";

export const listEmployeeProcedure = companyImpl.employee.list
  .use(
    userPermissionMiddleware([
      "system.company_employee.manage",
      "system.company_employee.list",
    ])
  )
  .handler(async ({ context, input }) => {
    const { where, orderBy, limit, offset, page } = buildPaginateOptions(
      {
        firstName: EmployeeTable.firstName,
        lastName: EmployeeTable.lastName,
        email: EmployeeTable.email,
        companyId: EmployeeTable.companyId,
        createdAt: EmployeeTable.createdAt,
      },
      input
    );

    const joinedQuery = context.db
      .select({
        id: EmployeeTable.id,
        firstName: EmployeeTable.firstName,
        middleName: EmployeeTable.middleName,
        lastName: EmployeeTable.lastName,
        email: EmployeeTable.email,
        phone: EmployeeTable.phone,
        jobTitle: EmployeeTable.jobTitle,
        department: EmployeeTable.department,
        website: EmployeeTable.website,
        createdAt: EmployeeTable.createdAt,
        updatedAt: EmployeeTable.updatedAt,
        company: {
          id: CompanyTable.id,
          name: CompanyTable.name,
        },
      })
      .from(EmployeeTable)
      .innerJoin(CompanyTable, eq(EmployeeTable.companyId, CompanyTable.id))
      .where(where);

    const [totalCount, employees] = await Promise.all([
      context.db.$count(EmployeeTable),
      joinedQuery.orderBy(orderBy).limit(limit).offset(offset),
    ]);

    const meta = buildPaginationMeta(totalCount, employees.length, page, limit);

    return apiResponse(API_MESSAGES.COMPANY.EMPLOYEE.GET_ALL, {
      meta,
      data: employees,
    });
  });

export const employeeDetailsProcedure = companyImpl.employee.details
  .use(
    userPermissionMiddleware([
      "system.company_employee.manage",
      "system.company_employee.read",
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const [employeeData] = await context.db
      .select({
        id: EmployeeTable.id,
        firstName: EmployeeTable.firstName,
        middleName: EmployeeTable.middleName,
        lastName: EmployeeTable.lastName,
        email: EmployeeTable.email,
        phone: EmployeeTable.phone,
        jobTitle: EmployeeTable.jobTitle,
        department: EmployeeTable.department,
        website: EmployeeTable.website,
        createdAt: EmployeeTable.createdAt,
        updatedAt: EmployeeTable.updatedAt,
        createdByUser: userProfileColumns,
        company: {
          id: CompanyTable.id,
          name: CompanyTable.name,
        },
      })
      .from(EmployeeTable)
      .innerJoin(CompanyTable, eq(EmployeeTable.companyId, CompanyTable.id))
      .innerJoin(UserTable, eq(UserTable.id, EmployeeTable.createdBy))
      .innerJoin(UserRoleTable, eq(UserRoleTable.userId, UserTable.id))
      .innerJoin(RoleTable, eq(RoleTable.id, UserRoleTable.roleId))
      .where(eq(EmployeeTable.id, input.employeeId))
      .groupBy(EmployeeTable.id, CompanyTable.id, UserTable.id)
      .limit(1);

    if (!employeeData) throw errors.NOT_FOUND();

    const addresses = await context.db
      .select({
        id: AddressTable.id,
        type: AddressTable.type,
        streetLine1: AddressTable.streetLine1,
        streetLine2: AddressTable.streetLine2,
        city: AddressTable.city,
        state: AddressTable.state,
        zipCode: AddressTable.zipCode,
        country: AddressTable.country,
        latitude: AddressTable.latitude,
        longitude: AddressTable.longitude,
        notes: AddressTable.notes,
        createdAt: AddressTable.createdAt,
        updatedAt: AddressTable.updatedAt,
        isPrimary: EmployeeAddressTable.isPrimary,
      })
      .from(AddressTable)
      .innerJoin(
        EmployeeAddressTable,
        eq(EmployeeAddressTable.addressId, AddressTable.id)
      )
      .where(eq(EmployeeAddressTable.employeeId, employeeData.id));

    const socialMedia = await context.db
      .select({
        id: SocialMediaTable.id,
        type: SocialMediaTable.type,
        platform: SocialMediaTable.platform,
        username: SocialMediaTable.username,
        url: SocialMediaTable.url,
        displayName: SocialMediaTable.displayName,
        notes: SocialMediaTable.notes,
        createdAt: SocialMediaTable.createdAt,
        updatedAt: SocialMediaTable.updatedAt,
      })
      .from(SocialMediaTable)
      .innerJoin(
        EmployeeSocialTable,
        eq(EmployeeSocialTable.socialMediaId, SocialMediaTable.id)
      )
      .where(eq(EmployeeSocialTable.employeeId, employeeData.id));

    return apiResponse(API_MESSAGES.COMPANY.EMPLOYEE.GET_DETAILS, {
      ...employeeData,
      addresses,
      socialMedia,
    });
  });

export const employeeCreateProcedure = companyImpl.employee.create
  .use(
    userPermissionMiddleware([
      "system.company_employee.manage",
      "system.company_employee.create",
    ])
  )
  .handler(async ({ context, input }) => {
    const { addresses, socialMedia, ...inputEmployee } = input;

    const employeeData = await context.db.transaction(async (tx) => {
      const [employeeData] = await tx
        .insert(EmployeeTable)
        .values({
          companyId: inputEmployee.companyId,
          firstName: inputEmployee.firstName,
          middleName: inputEmployee.middleName,
          lastName: inputEmployee.lastName,
          email: inputEmployee.email,
          phone: inputEmployee.phone,
          jobTitle: inputEmployee.jobTitle,
          department: inputEmployee.department,
          website: inputEmployee.website,
          createdBy: context.user.id,
        } satisfies InsertEmployee)
        .returning();

      if (!employeeData) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: API_MESSAGES.COMPANY.EMPLOYEE.NOT_CREATE,
        });
      }

      if (socialMedia.length > 0) {
        const socialMediaIds = await tx
          .insert(SocialMediaTable)
          .values(socialMedia satisfies Array<InsertSocialMedia>)
          .returning({ id: SocialMediaTable.id });

        await tx.insert(EmployeeSocialTable).values(
          socialMediaIds.map(
            ({ id }) =>
              ({
                socialMediaId: id,
                employeeId: employeeData.id,
              }) satisfies InsertEmployeeSocial
          )
        );
      }

      if (addresses.length > 0) {
        const employeeAddressesIds = await tx
          .insert(AddressTable)
          .values(addresses satisfies Array<InsertAddress>)
          .returning({ id: AddressTable.id });

        await tx.insert(EmployeeAddressTable).values(
          employeeAddressesIds.map(
            ({ id }, idx) =>
              ({
                addressId: id,
                employeeId: employeeData.id,
                isPrimary: addresses[idx]?.isPrimary ?? false,
              }) satisfies InsertEmployeeAddress
          )
        );
      }

      return employeeData;
    });

    return apiResponse(API_MESSAGES.COMPANY.EMPLOYEE.CREATE, employeeData);
  });

export const employeeUpdateProcedure = companyImpl.employee.update
  .use(
    userPermissionMiddleware([
      "system.company_employee.manage",
      "system.company_employee.update",
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const { employeeId, socialMedia, addresses, ...restInput } = input;

    const [existing] = await context.db
      .select({ id: EmployeeTable.id })
      .from(EmployeeTable)
      .where(eq(EmployeeTable.id, employeeId))
      .limit(1);

    if (!existing) throw errors.NOT_FOUND();

    const employeeData = await context.db.transaction(async (tx) => {
      let updatedEmployeeData: EmployeeDataModel;

      if (Object.keys(restInput).length > 0) {
        const updateData: UpdateEmployee = { ...restInput };

        const [employeeData] = await tx
          .update(EmployeeTable)
          .set(updateData)
          .where(eq(EmployeeTable.id, employeeId))
          .returning();

        if (!employeeData) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: API_MESSAGES.COMPANY.NOT_UPDATE,
          });
        }
        updatedEmployeeData = employeeData;
      } else {
        const [employeeData] = await tx
          .select()
          .from(EmployeeTable)
          .where(eq(EmployeeTable.id, employeeId))
          .limit(1);

        if (!employeeData) throw errors.NOT_FOUND();

        updatedEmployeeData = employeeData;
      }

      if (socialMedia && socialMedia.length > 0) {
        const existingSocialMedia = await tx
          .select({ id: EmployeeSocialTable.socialMediaId })
          .from(EmployeeSocialTable)
          .where(eq(EmployeeSocialTable.employeeId, employeeId));

        if (existingSocialMedia.length > 0) {
          await tx.delete(SocialMediaTable).where(
            inArray(
              SocialMediaTable.id,
              existingSocialMedia.map(({ id }) => id)
            )
          );
        }

        const socialMediaIds = await tx
          .insert(SocialMediaTable)
          .values(socialMedia satisfies Array<InsertSocialMedia>)
          .returning({ id: SocialMediaTable.id });

        await tx.insert(EmployeeSocialTable).values(
          socialMediaIds.map(
            ({ id }) =>
              ({
                socialMediaId: id,
                employeeId,
              }) satisfies InsertEmployeeSocial
          )
        );
      }

      if (addresses && addresses.length > 0) {
        const existingAddresses = await tx
          .select({ id: EmployeeAddressTable.addressId })
          .from(EmployeeAddressTable)
          .where(eq(EmployeeAddressTable.employeeId, employeeId));

        if (existingAddresses.length > 0) {
          await tx.delete(AddressTable).where(
            inArray(
              AddressTable.id,
              existingAddresses.map(({ id }) => id)
            )
          );
        }

        const addressesIds = await tx
          .insert(AddressTable)
          .values(addresses satisfies Array<InsertAddress>)
          .returning({ id: AddressTable.id });

        await tx.insert(EmployeeAddressTable).values(
          addressesIds.map(
            ({ id }, idx) =>
              ({
                addressId: id,
                employeeId,
                isPrimary: addresses[idx]?.isPrimary ?? false,
              }) satisfies InsertEmployeeAddress
          )
        );
      }

      return updatedEmployeeData;
    });

    return apiResponse(API_MESSAGES.COMPANY.EMPLOYEE.UPDATE, employeeData);
  });

export const employeeDeleteProcedure = companyImpl.employee.delete
  .use(
    userPermissionMiddleware([
      "system.company_employee.manage",
      "system.company_employee.delete",
    ])
  )
  .handler(async ({ context, input, errors }) => {
    const employeeIds = await context.db
      .select({ id: EmployeeTable.id })
      .from(EmployeeTable)
      .where(inArray(EmployeeTable.id, input.employeeIds));

    if (employeeIds.length === 0) throw errors.NOT_FOUND();

    await context.db.delete(EmployeeTable).where(
      inArray(
        EmployeeTable.id,
        employeeIds.map(({ id }) => id)
      )
    );

    return apiResponse(API_MESSAGES.COMPANY.EMPLOYEE.DELETE, null);
  });

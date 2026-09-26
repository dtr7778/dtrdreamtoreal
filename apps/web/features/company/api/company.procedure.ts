import { implement, ORPCError } from "@orpc/server";
import { and, count, desc, eq, inArray, isNotNull, SQL } from "drizzle-orm";

import {
  type CompanyDescriptionAnswer,
  streamCompanyDescription,
} from "@workspace/ai";
import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  AddressTable,
  AiUsageTable,
  CompanyAddressTable,
  CompanyAiUsageTable,
  CompanyDataModel,
  CompanyEmailThreadTable,
  CompanySocialTable,
  CompanyTable,
  EmailTable,
  EmailThreadTable,
  EmployeeAddressTable,
  EmployeeSocialTable,
  EmployeeTable,
  InsertAddress,
  InsertCompany,
  InsertCompanyAddress,
  InsertCompanyEmailThread,
  InsertCompanySocial,
  InsertEmailThread,
  InsertEmployee,
  InsertEmployeeAddress,
  InsertSocialMedia,
  RoleTable,
  SocialMediaTable,
  UpdateCompany,
  UserRoleTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import { apiResponse } from "@workspace/lib/utils";

import { env } from "@/lib/env";

import { API_MESSAGES } from "@/constants/apiMessage";
import { userProfileColumns } from "@/features/user/user.api-schema";
import {
  authMiddleware,
  userPermissionMiddleware,
} from "@/server/middleware/auth.middleware";
import { errorMiddleware } from "@/server/middleware/error.middleware";
import {
  aiRateLimitMiddleware,
  privateRateLimitMiddleware,
} from "@/server/middleware/rateLimit.middleware";
import { ORPCContext } from "@/types/orpc.types";

import { contextSections } from "../components/forms/CompanyCreateForm/data/context-questions";
import { companyContract } from "./company.contract";

export const companyImpl = implement(companyContract)
  .$context<ORPCContext>()
  .use(errorMiddleware)
  .use(privateRateLimitMiddleware)
  .use(authMiddleware);

export const listCompanyProcedure = companyImpl.list
  .use(
    userPermissionMiddleware(["system.company.manage", "system.company.list"])
  )
  .handler(async ({ context, input }) => {
    const { where, orderBy, limit, offset, page } = buildPaginateOptions(
      {
        name: CompanyTable.name,
        email: CompanyTable.email,
        createdAt: CompanyTable.createdAt,
      },
      input
    );

    const joinedQuery = context.db
      .select({
        id: CompanyTable.id,
        name: CompanyTable.name,
        legalName: CompanyTable.legalName,
        website: CompanyTable.website,
        industry: CompanyTable.industry,
        employSize: CompanyTable.employSize,
        employeeCount: count(EmployeeTable.id).as("employee_count"),
        createdByUser: userProfileColumns,
        email: CompanyTable.email,
        phone: CompanyTable.phone,
        createdAt: CompanyTable.createdAt,
        updatedAt: CompanyTable.updatedAt,
      })
      .from(CompanyTable)
      .leftJoin(EmployeeTable, eq(EmployeeTable.companyId, CompanyTable.id))
      .innerJoin(UserTable, eq(UserTable.id, CompanyTable.createdBy))
      .innerJoin(UserRoleTable, eq(UserRoleTable.userId, UserTable.id))
      .innerJoin(RoleTable, eq(RoleTable.id, UserRoleTable.roleId))
      .where(where)
      .groupBy(CompanyTable.id, UserTable.id);

    const [totalCount, companies] = await Promise.all([
      context.db.$count(
        context.db.select({ id: CompanyTable.id }).from(CompanyTable)
      ),
      joinedQuery.orderBy(orderBy).limit(limit).offset(offset),
    ]);

    const meta = buildPaginationMeta(totalCount, companies.length, page, limit);

    return apiResponse(API_MESSAGES.COMPANY.GET_ALL, { meta, data: companies });
  });

export const listCompanyForSearchProcedure = companyImpl.listForSearch
  .use(
    userPermissionMiddleware(["system.company.manage", "system.company.list"])
  )
  .handler(async ({ context, input }) => {
    const { where, orderBy, limit, offset } = buildPaginateOptions(
      {
        id: CompanyTable.id,
        name: CompanyTable.name,
        email: CompanyTable.email,
        createdAt: CompanyTable.createdAt,
      },
      input
    );

    const companies = await context.db
      .select({
        id: CompanyTable.id,
        name: CompanyTable.name,
        legalName: CompanyTable.legalName,
        website: CompanyTable.website,
        industry: CompanyTable.industry,
        employSize: CompanyTable.employSize,
        email: CompanyTable.email,
        phone: CompanyTable.phone,
        createdAt: CompanyTable.createdAt,
        updatedAt: CompanyTable.updatedAt,
      })
      .from(CompanyTable)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return apiResponse(API_MESSAGES.COMPANY.GET_ALL_FOR_SEARCH, companies);
  });

export const companyDetailsProcedure = companyImpl.details
  .use(
    userPermissionMiddleware(["system.company.manage", "system.company.read"])
  )
  .handler(async ({ context, input, errors }) => {
    const [companyData] = await context.db
      .select({
        id: CompanyTable.id,
        name: CompanyTable.name,
        legalName: CompanyTable.legalName,
        website: CompanyTable.website,
        industry: CompanyTable.industry,
        employSize: CompanyTable.employSize,
        employeeCount: count(EmployeeTable.id).as("employee_count"),
        email: CompanyTable.email,
        phone: CompanyTable.phone,
        createdByUser: userProfileColumns,
        description: CompanyTable.description,
        context: CompanyTable.context,
        createdAt: CompanyTable.createdAt,
        updatedAt: CompanyTable.updatedAt,
      })
      .from(CompanyTable)
      .leftJoin(EmployeeTable, eq(EmployeeTable.companyId, CompanyTable.id))
      .innerJoin(UserTable, eq(UserTable.id, CompanyTable.createdBy))
      .innerJoin(UserRoleTable, eq(UserRoleTable.userId, UserTable.id))
      .innerJoin(RoleTable, eq(RoleTable.id, UserRoleTable.roleId))
      .where(eq(CompanyTable.id, input.companyId))
      .groupBy(CompanyTable.id, UserTable.id)
      .limit(1);

    if (!companyData) throw errors.NOT_FOUND();

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
        isPrimary: CompanyAddressTable.isPrimary,
      })
      .from(AddressTable)
      .innerJoin(
        CompanyAddressTable,
        eq(CompanyAddressTable.addressId, AddressTable.id)
      )
      .where(eq(CompanyAddressTable.companyId, companyData.id));

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
        CompanySocialTable,
        eq(CompanySocialTable.socialMediaId, SocialMediaTable.id)
      )
      .where(eq(CompanySocialTable.companyId, companyData.id));

    const aiUsages = await context.db
      .select({
        id: AiUsageTable.id,
        provider: AiUsageTable.provider,
        model: AiUsageTable.model,
        activity: AiUsageTable.activity,
        promptTokens: AiUsageTable.promptTokens,
        completionTokens: AiUsageTable.completionTokens,
        totalTokens: AiUsageTable.totalTokens,
        cost: AiUsageTable.cost,
        latencyMs: AiUsageTable.latencyMs,
        createdAt: AiUsageTable.createdAt,
      })
      .from(AiUsageTable)
      .innerJoin(
        CompanyAiUsageTable,
        eq(CompanyAiUsageTable.aiUsageId, AiUsageTable.id)
      )
      .where(eq(CompanyAiUsageTable.companyId, companyData.id))
      .orderBy(desc(AiUsageTable.createdAt));

    return apiResponse(API_MESSAGES.COMPANY.GET_DETAILS, {
      ...companyData,
      addresses,
      socialMedia,
      aiUsages,
    });
  });

function sanitizeContext(
  context: Record<string, string | string[] | undefined>
): Record<string, string | string[]> {
  return Object.fromEntries(
    Object.entries(context).filter(([, value]) => value !== undefined)
  ) as Record<string, string | string[]>;
}

export const companyCreateProcedure = companyImpl.create
  .use(
    userPermissionMiddleware(["system.company.manage", "system.company.create"])
  )
  .handler(async ({ context, input }) => {
    const { employees, addresses, socialMedia, aiUsageIds, ...inputCompany } =
      input;

    const companyData = await context.db.transaction(async (tx) => {
      const [companyData] = await tx
        .insert(CompanyTable)
        .values({
          name: inputCompany.name,
          legalName: inputCompany.legalName,
          website: inputCompany.website,
          industry: inputCompany.industry,
          employSize: inputCompany.employSize,
          email: inputCompany.email,
          phone: inputCompany.phone,
          description: inputCompany.description,
          context: sanitizeContext(inputCompany.context),
          createdBy: context.user.id,
        } satisfies InsertCompany)
        .returning();

      if (!companyData) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: API_MESSAGES.COMPANY.NOT_CREATE,
        });
      }

      if (aiUsageIds && aiUsageIds.length > 0) {
        await tx.insert(CompanyAiUsageTable).values(
          aiUsageIds.map((aiUsageId) => ({
            companyId: companyData.id,
            aiUsageId,
          }))
        );
      }

      if (socialMedia.length > 0) {
        const socialMediaIds = await tx
          .insert(SocialMediaTable)
          .values(socialMedia satisfies Array<InsertSocialMedia>)
          .returning({ id: SocialMediaTable.id });

        await tx.insert(CompanySocialTable).values(
          socialMediaIds.map(
            ({ id }) =>
              ({
                socialMediaId: id,
                companyId: companyData.id,
              }) satisfies InsertCompanySocial
          )
        );
      }

      if (addresses.length > 0) {
        const addressesIds = await tx
          .insert(AddressTable)
          .values(addresses satisfies Array<InsertAddress>)
          .returning({ id: AddressTable.id });

        await tx.insert(CompanyAddressTable).values(
          addressesIds.map(
            ({ id }, idx) =>
              ({
                addressId: id,
                companyId: companyData.id,
                isPrimary: addresses[idx]?.isPrimary ?? false,
              }) satisfies InsertCompanyAddress
          )
        );
      }

      for (const { socialMedia, addresses, ...employee } of employees) {
        const [employeeData] = await tx
          .insert(EmployeeTable)
          .values({
            companyId: companyData.id,
            firstName: employee.firstName,
            middleName: employee.middleName,
            lastName: employee.lastName,
            email: employee.email,
            phone: employee.phone,
            jobTitle: employee.jobTitle,
            department: employee.department,
            website: employee.website,
            createdBy: context.user.id,
          } satisfies InsertEmployee)
          .returning({
            id: EmployeeTable.id,
          });

        if (!employeeData) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: API_MESSAGES.COMPANY.EMPLOYEE.NOT_CREATE,
          });
        }

        if (socialMedia.length > 0) {
          const employeeSocialMediaIds = await tx
            .insert(SocialMediaTable)
            .values(socialMedia satisfies Array<InsertSocialMedia>)
            .returning({ id: SocialMediaTable.id });

          await tx.insert(EmployeeSocialTable).values(
            employeeSocialMediaIds.map(({ id }) => ({
              socialMediaId: id,
              employeeId: employeeData.id,
            }))
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
      }

      return companyData;
    });

    return apiResponse(API_MESSAGES.COMPANY.CREATE, companyData);
  });

export const companyGenerateDescriptionProcedure =
  companyImpl.generateDescription
    .use(aiRateLimitMiddleware)
    .use(
      userPermissionMiddleware([
        "system.company.manage",
        "system.company.create",
        "system.company.update",
      ])
    )
    .handler(async function* ({ context, input }) {
      const answers: Array<CompanyDescriptionAnswer> = contextSections
        .flatMap((section) =>
          section.questions.map((question) => ({
            label: `${section.title}: ${question.label}`,
            value: input.context?.[question.name],
          }))
        )
        .filter((answer): answer is CompanyDescriptionAnswer => {
          if (answer.value === undefined) return false;
          return Array.isArray(answer.value)
            ? answer.value.length > 0
            : answer.value.trim().length > 0;
        });

      try {
        for await (const chunk of streamCompanyDescription({
          companyName: input.name,
          industry: input.industry,
          website: input.website,
          answers,
          apiKey: env.OPENROUTER_API_KEY,
          model: env.OPENROUTER_MODEL,
          appTitle: env.NEXT_PUBLIC_SITE_NAME,
          httpReferer: env.NEXT_PUBLIC_SITE_URL,
        })) {
          if (chunk.type === "delta") {
            yield { type: "delta" as const, value: chunk.delta };
            continue;
          }
          const [aiUsage] = await context.db
            .insert(AiUsageTable)
            .values({
              provider: "openrouter",
              model: chunk.usage.model,
              activity: "company_description",
              promptTokens: chunk.usage.promptTokens,
              completionTokens: chunk.usage.completionTokens,
              totalTokens: chunk.usage.totalTokens,
              cost: chunk.usage.cost,
              latencyMs: chunk.usage.latencyMs,
              createdBy: context.user.id,
            })
            .returning({ id: AiUsageTable.id });

          if (!aiUsage) {
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
              message: API_MESSAGES.AI.NOT_GENERATE,
            });
          }

          if (input.companyId) {
            await context.db.insert(CompanyAiUsageTable).values({
              companyId: input.companyId,
              aiUsageId: aiUsage.id,
            });
          }

          yield {
            type: "done" as const,
            usage: { ...chunk.usage, id: aiUsage.id },
          };
        }
      } catch (error) {
        console.log(error);
        if (error instanceof ORPCError) throw error;
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: API_MESSAGES.AI.NOT_GENERATE,
        });
      }
    });

export const companyUpdateProcedure = companyImpl.update
  .use(
    userPermissionMiddleware(["system.company.manage", "system.company.update"])
  )
  .handler(async ({ context, input, errors }) => {
    const {
      companyId,
      addresses,
      socialMedia,
      context: contextInput,
      ...restInput
    } = input;

    const [existing] = await context.db
      .select({ id: CompanyTable.id })
      .from(CompanyTable)
      .where(eq(CompanyTable.id, companyId))
      .limit(1);

    if (!existing) throw errors.NOT_FOUND();

    const hasCompanyUpdate =
      Object.keys(restInput).length > 0 || contextInput !== undefined;

    const companyData = await context.db.transaction(async (tx) => {
      let updatedCompanyData: CompanyDataModel;

      if (hasCompanyUpdate) {
        const updateData: UpdateCompany = {
          ...restInput,
          ...(contextInput !== undefined
            ? { context: sanitizeContext(contextInput) }
            : {}),
        };

        const [companyData] = await tx
          .update(CompanyTable)
          .set(updateData)
          .where(eq(CompanyTable.id, companyId))
          .returning();

        if (!companyData) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: API_MESSAGES.COMPANY.NOT_UPDATE,
          });
        }
        updatedCompanyData = companyData;
      } else {
        const [companyData] = await tx
          .select()
          .from(CompanyTable)
          .where(eq(CompanyTable.id, companyId))
          .limit(1);

        if (!companyData) throw errors.NOT_FOUND();

        updatedCompanyData = companyData;
      }

      if (socialMedia && socialMedia.length > 0) {
        const existingSocialMedia = await tx
          .select({ id: CompanySocialTable.socialMediaId })
          .from(CompanySocialTable)
          .where(eq(CompanySocialTable.companyId, companyId));

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

        await tx.insert(CompanySocialTable).values(
          socialMediaIds.map(
            ({ id }) =>
              ({
                socialMediaId: id,
                companyId,
              }) satisfies InsertCompanySocial
          )
        );
      }

      if (addresses && addresses.length > 0) {
        const existingAddresses = await tx
          .select({ id: CompanyAddressTable.addressId })
          .from(CompanyAddressTable)
          .where(eq(CompanyAddressTable.companyId, companyId));

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

        await tx.insert(CompanyAddressTable).values(
          addressesIds.map(
            ({ id }, idx) =>
              ({
                addressId: id,
                companyId,
                isPrimary: addresses[idx]?.isPrimary ?? false,
              }) satisfies InsertCompanyAddress
          )
        );
      }

      return updatedCompanyData;
    });

    return apiResponse(API_MESSAGES.COMPANY.UPDATE, companyData);
  });

export const companyDeleteProcedure = companyImpl.delete
  .use(
    userPermissionMiddleware(["system.company.manage", "system.company.delete"])
  )
  .handler(async ({ context, input, errors }) => {
    const companyIds = await context.db
      .select({ id: CompanyTable.id })
      .from(CompanyTable)
      .where(inArray(CompanyTable.id, input.companyIds));

    if (companyIds.length === 0) throw errors.NOT_FOUND();

    await context.db.delete(CompanyTable).where(
      inArray(
        CompanyTable.id,
        companyIds.map(({ id }) => id)
      )
    );

    return apiResponse(API_MESSAGES.COMPANY.DELETE, null);
  });

export const listCompanyEmailThreadProcedure = companyImpl.emailThread.list
  .use(
    userPermissionMiddleware(["system.company.manage", "system.company.list"])
  )
  .handler(async ({ context, input }) => {
    const { where, orderBy, limit, offset, page } = buildPaginateOptions(
      {
        subject: EmailThreadTable.subject,
        contactEmail: EmailThreadTable.contactEmail,
        createdAt: EmailThreadTable.createdAt,
      },
      input
    );

    const joinedQuery = context.db
      .select({
        id: EmailThreadTable.id,
        subject: EmailThreadTable.subject,
        contactEmail: EmailThreadTable.contactEmail,
        contactName: EmailThreadTable.contactName,
        createdByUser: userProfileColumns,
        isClosed: EmailThreadTable.isClosed,
        closedAt: EmailThreadTable.closedAt,
        createdAt: EmailThreadTable.createdAt,
        updatedAt: EmailThreadTable.updatedAt,
        totalEmail: count(EmailTable.id).as("total_email"),
      })
      .from(EmailThreadTable)
      .innerJoin(
        CompanyEmailThreadTable,
        eq(CompanyEmailThreadTable.emailThreadId, EmailThreadTable.id)
      )
      .leftJoin(EmailTable, eq(EmailThreadTable.id, EmailTable.threadId))
      .leftJoin(UserTable, eq(EmailThreadTable.closedBy, UserTable.id))
      .leftJoin(UserRoleTable, eq(UserRoleTable.userId, UserTable.id))
      .leftJoin(RoleTable, eq(RoleTable.id, UserRoleTable.roleId))
      .where(and(eq(CompanyEmailThreadTable.companyId, input.companyId), where))
      .groupBy(EmailThreadTable.id, UserTable.id);

    const [totalCount, emailThreads] = await Promise.all([
      context.db.$count(
        context.db
          .select({ id: EmailThreadTable.id })
          .from(EmailThreadTable)
          .innerJoin(
            CompanyEmailThreadTable,
            eq(CompanyEmailThreadTable.emailThreadId, EmailThreadTable.id)
          )
          .where(eq(CompanyEmailThreadTable.companyId, input.companyId))
      ),
      joinedQuery.orderBy(orderBy).limit(limit).offset(offset),
    ]);

    const meta = buildPaginationMeta(
      totalCount,
      emailThreads.length,
      page,
      limit
    );

    return apiResponse(API_MESSAGES.COMPANY.EMAIL_THREAD.GET_ALL, {
      meta,
      data: emailThreads,
    });
  });

export const companyEmailThreadCreateProcedure = companyImpl.emailThread.create
  .use(
    userPermissionMiddleware(["system.company.manage", "system.company.update"])
  )
  .handler(async ({ context, errors, input }) => {
    const [company] = await context.db
      .select({
        id: CompanyTable.id,
        email: CompanyTable.email,
        name: CompanyTable.name,
      })
      .from(CompanyTable)
      .where(
        and(eq(CompanyTable.id, input.companyId), isNotNull(CompanyTable.email))
      )
      .limit(1);

    const companyEmail = company?.email;

    if (!company || !companyEmail) {
      throw errors.NOT_FOUND();
    }

    const thread = await context.db.transaction(async (tx) => {
      const [thread] = await tx
        .insert(EmailThreadTable)
        .values({
          subject: input.subject,
          contactEmail: companyEmail,
          contactName: company.name,
        } satisfies InsertEmailThread)
        .returning();

      if (!thread) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: API_MESSAGES.COMPANY.EMAIL_THREAD.NOT_CREATE,
        });
      }

      await tx.insert(CompanyEmailThreadTable).values({
        companyId: company.id,
        emailThreadId: thread.id,
      } satisfies InsertCompanyEmailThread);

      return thread;
    });

    return apiResponse(API_MESSAGES.COMPANY.EMAIL_THREAD.CREATE, thread);
  });

export const listCompanyEmailProcedure = companyImpl.emailThread.email.list
  .use(
    userPermissionMiddleware(["system.company.manage", "system.company.list"])
  )
  .handler(async ({ context, input }) => {
    const { where, orderBy, limit, offset, page } = buildPaginateOptions(
      {
        subject: EmailTable.subject,
        createdAt: EmailTable.createdAt,
      },
      input
    );

    const threadWhereSql: Array<SQL> = [
      eq(CompanyEmailThreadTable.companyId, input.companyId),
    ];

    if (input?.threadId) {
      threadWhereSql.push(eq(EmailThreadTable.id, input.threadId));
    }

    const threads = await context.db
      .select({
        id: EmailThreadTable.id,
      })
      .from(EmailThreadTable)
      .innerJoin(
        CompanyEmailThreadTable,
        eq(CompanyEmailThreadTable.emailThreadId, EmailTable.id)
      )
      .where(and(...threadWhereSql));

    if (threads.length === 0) {
      throw new ORPCError("NOT_FOUND", {
        message: API_MESSAGES.COMPANY.EMAIL_THREAD.NOT_FOUND,
      });
    }

    const joinedQuery = context.db
      .select({
        id: EmailTable.id,
        subject: EmailTable.subject,
        direction: EmailTable.direction,
        status: EmailTable.status,
        threadId: EmailTable.threadId,
        createdAt: EmailTable.createdAt,
        updatedAt: EmailTable.updatedAt,
      })
      .from(EmailTable)
      .where(
        and(
          inArray(
            EmailTable.threadId,
            threads.map(({ id }) => id)
          ),
          where
        )
      );

    const [totalCount, emails] = await Promise.all([
      context.db.$count(
        context.db
          .select({ id: EmailTable.id })
          .from(EmailTable)
          .where(
            inArray(
              EmailTable.threadId,
              threads.map(({ id }) => id)
            )
          )
      ),
      joinedQuery.orderBy(orderBy).limit(limit).offset(offset),
    ]);

    const meta = buildPaginationMeta(totalCount, emails.length, page, limit);

    return apiResponse(API_MESSAGES.COMPANY.EMAIL_THREAD.EMAIL.GET_ALL, {
      meta,
      data: emails,
    });
  });

import { implement } from "@orpc/server";

import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import { ContactSubmissionTable } from "@workspace/drizzle/schemas";
import { apiResponse } from "@workspace/lib/utils";

import { API_MESSAGES } from "@/constants/apiMessage";
import {
  authMiddleware,
  userPermissionMiddleware,
} from "@/server/middleware/auth.middleware";
import { errorMiddleware } from "@/server/middleware/error.middleware";
import { privateRateLimitMiddleware } from "@/server/middleware/rateLimit.middleware";
import { ORPCContext } from "@/types/orpc.types";

import { contactContract } from "./contact.contract";

export const contactImpl = implement(contactContract)
  .$context<ORPCContext>()
  .use(errorMiddleware);

export const listContactProcedure = contactImpl.list
  .use(privateRateLimitMiddleware)
  .use(authMiddleware)
  .use(
    userPermissionMiddleware(["system.contact.manage", "system.contact.list"])
  )
  .handler(async ({ context, input }) => {
    const { page, limit, offset, orderBy, where } = buildPaginateOptions(
      {
        subject: ContactSubmissionTable.subject,
        createdAt: ContactSubmissionTable.createdAt,
        status: ContactSubmissionTable.status,
      },
      input
    );

    const joinedQuery = context.db
      .select({
        id: ContactSubmissionTable.id,
        name: ContactSubmissionTable.name,
        email: ContactSubmissionTable.email,
        subject: ContactSubmissionTable.subject,
        phone: ContactSubmissionTable.phone,
        company: ContactSubmissionTable.company,
        status: ContactSubmissionTable.status,
        createdAt: ContactSubmissionTable.createdAt,
        updatedAt: ContactSubmissionTable.updatedAt,
      })
      .from(ContactSubmissionTable)
      .where(where)
      .$dynamic();

    const [totalContact, contacts] = await Promise.all([
      context.db.$count(
        context.db
          .select({ id: ContactSubmissionTable.id })
          .from(ContactSubmissionTable)
      ),
      joinedQuery.orderBy(orderBy).offset(offset).limit(limit),
    ]);

    const meta = buildPaginationMeta(
      totalContact,
      contacts.length,
      page,
      limit
    );

    return apiResponse(API_MESSAGES.CONTACT.GET_ALL, {
      meta,
      data: contacts,
    });
  });

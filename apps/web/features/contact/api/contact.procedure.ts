import { implement } from "@orpc/server";
import { eq } from "drizzle-orm";

import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  ContactSubmissionTable,
  ContactUserTable,
} from "@workspace/drizzle/schemas";
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
        contactUser: {
          name: ContactUserTable.name,
          email: ContactUserTable.email,
          phone: ContactUserTable.phone,
          company: ContactUserTable.company,
        },
        subject: ContactSubmissionTable.subject,
        status: ContactSubmissionTable.status,
        createdAt: ContactSubmissionTable.createdAt,
        updatedAt: ContactSubmissionTable.updatedAt,
      })
      .from(ContactSubmissionTable)
      .innerJoin(
        ContactUserTable,
        eq(ContactUserTable.id, ContactSubmissionTable.contactUserId)
      )
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

export const detailsContactProcedure = contactImpl.details
  .use(privateRateLimitMiddleware)
  .use(authMiddleware)
  .use(
    userPermissionMiddleware(["system.contact.manage", "system.contact.list"])
  )
  .handler(async ({ context, input }) => {
    const { contactId } = input;

    const [submission] = await context.db
      .select({
        id: ContactSubmissionTable.id,
        subject: ContactSubmissionTable.subject,
        status: ContactSubmissionTable.status,
        message: ContactSubmissionTable.message,
        createdAt: ContactSubmissionTable.createdAt,
        updatedAt: ContactSubmissionTable.updatedAt,
        name: ContactUserTable.name,
        email: ContactUserTable.email,
        phone: ContactUserTable.phone,
        company: ContactUserTable.company,
      })
      .from(ContactSubmissionTable)
      .innerJoin(
        ContactUserTable,
        eq(ContactUserTable.id, ContactSubmissionTable.contactUserId)
      )
      .where(eq(ContactSubmissionTable.id, contactId));

    if (!submission) {
      throw new Error("Contact not found");
    }

    return apiResponse(API_MESSAGES.CONTACT.GET_DETAILS, {
      ...submission,
      replies: [],
    });
  });

export const createReplyContactProcedure = contactImpl.createReply
  .use(privateRateLimitMiddleware)
  .use(authMiddleware)
  .use(
    userPermissionMiddleware(["system.contact.manage", "system.contact.read"])
  )
  .handler(async ({ context, input }) => {
    const { contactId } = input;

    const [submission] = await context.db
      .select({ id: ContactSubmissionTable.id })
      .from(ContactSubmissionTable)
      .where(eq(ContactSubmissionTable.id, contactId));

    if (!submission) {
      throw new Error("Contact not found");
    }

    return apiResponse(API_MESSAGES.CONTACT.REPLY_CREATED, null);
  });

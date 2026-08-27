import { implement } from "@orpc/server";
import { desc, eq } from "drizzle-orm";

import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  ContactSubmissionReplyTable,
  ContactSubmissionTable,
  RoleTable,
  UserRoleTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import { apiResponse } from "@workspace/lib/utils";

import { mailProvider } from "@/lib/mail";

import { API_MESSAGES } from "@/constants/apiMessage";
import { userProfileColumns } from "@/features/user/user.api-schema";
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

export const detailsContactProcedure = contactImpl.details
  .use(privateRateLimitMiddleware)
  .use(authMiddleware)
  .use(
    userPermissionMiddleware(["system.contact.manage", "system.contact.read"])
  )
  .handler(async ({ input, errors, context }) => {
    const [contact] = await context.db
      .select()
      .from(ContactSubmissionTable)
      .where(eq(ContactSubmissionTable.id, input.contactId))
      .limit(1);

    if (!contact) {
      throw errors.NOT_FOUND();
    }

    const replies = await context.db
      .select({
        id: ContactSubmissionReplyTable.id,
        reply: ContactSubmissionReplyTable.reply,
        createdAt: ContactSubmissionReplyTable.createdAt,
        repliedByUser: userProfileColumns,
      })
      .from(ContactSubmissionReplyTable)
      .innerJoin(
        UserTable,
        eq(ContactSubmissionReplyTable.repliedBy, UserTable.id)
      )
      .innerJoin(UserRoleTable, eq(UserRoleTable.userId, UserTable.id))
      .innerJoin(RoleTable, eq(RoleTable.id, UserRoleTable.roleId))
      .where(eq(ContactSubmissionReplyTable.submissionId, contact.id))
      .orderBy(desc(ContactSubmissionReplyTable.createdAt))
      .groupBy(ContactSubmissionReplyTable.id, UserTable.id);

    return apiResponse(API_MESSAGES.CONTACT.GET_DETAILS, {
      ...contact,
      replies,
    });
  });

export const createReplyContactProcedure = contactImpl.createReply
  .use(privateRateLimitMiddleware)
  .use(authMiddleware)
  .use(
    userPermissionMiddleware(["system.contact.manage", "system.contact.update"])
  )
  .handler(async ({ input, errors, context }) => {
    const [contact] = await context.db
      .select({
        id: ContactSubmissionTable.id,
        name: ContactSubmissionTable.name,
        email: ContactSubmissionTable.email,
        subject: ContactSubmissionTable.subject,
      })
      .from(ContactSubmissionTable)
      .where(eq(ContactSubmissionTable.id, input.contactId))
      .limit(1);

    if (!contact) {
      throw errors.NOT_FOUND();
    }

    const replyData = await context.db.transaction(async (tx) => {
      const [reply] = await tx
        .insert(ContactSubmissionReplyTable)
        .values({
          submissionId: contact.id,
          repliedBy: context.user.id,
          reply: input.reply,
        })
        .returning({
          id: ContactSubmissionReplyTable.id,
          reply: ContactSubmissionReplyTable.reply,
          createdAt: ContactSubmissionReplyTable.createdAt,
          updatedAt: ContactSubmissionReplyTable.updatedAt,
        });

      if (!reply) {
        throw errors.BAD_REQUEST();
      }

      await tx
        .update(ContactSubmissionTable)
        .set({ status: "REPLIED" })
        .where(eq(ContactSubmissionTable.id, contact.id));

      await mailProvider.sendContactReplyMail({
        to: contact.email,
        userName: contact.name,
        subject: contact.subject,
        replyAuthor: context.user.name,
        replyContent: input.reply,
      });

      return reply;
    });

    return apiResponse(API_MESSAGES.CONTACT.REPLY_CREATED, {
      id: replyData.id,
      reply: replyData.reply,
      createdAt: replyData.createdAt,
      updatedAt: replyData.updatedAt,
    });
  });

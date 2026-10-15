import { and, eq, inArray, isNull, sql } from "drizzle-orm";

import { createDrizzleClient } from "@workspace/drizzle/client";
import {
  ChatMessageAttachmentTable,
  ChatMessageReactionTable,
  ChatMessageTable,
  ChatRoomMemberTable,
  ChatRoomTable,
  FileTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import { type ChatMessageRow, hydrateMessages } from "@workspace/lib/chat";
import {
  ApiError,
  apiResponse,
  BAD_REQUEST,
  FORBIDDEN,
  NOT_FOUND,
  OK,
  UNPROCESSABLE_ENTITY,
  UPGRADE_REQUIRED,
} from "@workspace/server-core";

import { getAuth } from "@/lib/auth";
import { getAuthUser } from "@/lib/getAuthUser";

import { API_MESSAGES } from "@/constant";
import type { ApiRouteHandler } from "@/types";

import { CHAT_HUB_NAME } from "./chat-hub.do";
import { broadcastToRoom } from "./chat.broadcast";
import { getRoomMembership } from "./chat.guard";
import { isReadAhead } from "./chat.read";
import type {
  ChatWebSocketRouteType,
  MarkRoomReadRouteType,
  SendMessageRouteType,
  ToggleReactionRouteType,
} from "./chat.routes";

export const chatWebSocketHandler: ApiRouteHandler<
  ChatWebSocketRouteType
> = async (c) => {
  if (c.req.header("Upgrade")?.toLowerCase() !== "websocket") {
    return apiResponse(c, {
      success: false,
      statusCode: UPGRADE_REQUIRED,
      message: "Expected WebSocket upgrade",
      data: null,
    });
  }

  const auth = getAuth(c.env);

  const authData = await getAuthUser(auth, c.req.raw.headers);

  const headers = new Headers(c.req.raw.headers);
  headers.set("x-user-id", authData.user.id);

  const stub = c.env.CHAT_HUB.getByName(CHAT_HUB_NAME);

  return stub.fetch(new Request(c.req.raw.url, { headers }));
};

export const sendMessageHandler: ApiRouteHandler<SendMessageRouteType> = async (
  c
) => {
  const input = c.req.valid("json");
  const user = c.get("user");

  const database = createDrizzleClient(c.env.DB);

  const membership = await getRoomMembership(database, input.roomId, user.id);

  if (!membership) {
    throw new ApiError({
      statusCode: FORBIDDEN,
      message: API_MESSAGES.CHAT.NOT_A_MEMBER,
    });
  }

  if (input.replyToMessageId) {
    const [replyTo] = await database
      .select({ id: ChatMessageTable.id })
      .from(ChatMessageTable)
      .where(
        and(
          eq(ChatMessageTable.id, input.replyToMessageId),
          eq(ChatMessageTable.roomId, input.roomId)
        )
      )
      .limit(1);

    if (!replyTo) {
      throw new ApiError({
        statusCode: NOT_FOUND,
        message: API_MESSAGES.CHAT.MESSAGE_NOT_FOUND,
      });
    }
  }

  if (input.parentMessageId) {
    const [parent] = await database
      .select({ id: ChatMessageTable.id })
      .from(ChatMessageTable)
      .where(
        and(
          eq(ChatMessageTable.id, input.parentMessageId),
          eq(ChatMessageTable.roomId, input.roomId)
        )
      )
      .limit(1);

    if (!parent) {
      throw new ApiError({
        statusCode: NOT_FOUND,
        message: API_MESSAGES.CHAT.MESSAGE_NOT_FOUND,
      });
    }
  }

  const fileIds = input.fileIds ?? [];

  if (fileIds.length > 0) {
    const ownedFiles = await database
      .select({ id: FileTable.id })
      .from(FileTable)
      .where(
        and(
          inArray(FileTable.id, fileIds),
          eq(FileTable.uploadedBy, user.id),
          isNull(FileTable.deletedAt)
        )
      );

    if (ownedFiles.length !== fileIds.length) {
      throw new ApiError({
        statusCode: UNPROCESSABLE_ENTITY,
        message: API_MESSAGES.CHAT.ATTACHMENT_INVALID,
      });
    }
  }

  const hasBody = (input.body?.content?.length ?? 0) > 0;

  if (!hasBody && fileIds.length === 0) {
    throw new ApiError({
      statusCode: BAD_REQUEST,
      message: API_MESSAGES.CHAT.EMPTY_MESSAGE,
    });
  }

  const [message] = await database
    .insert(ChatMessageTable)
    .values({
      roomId: input.roomId,
      senderId: user.id,
      type: hasBody ? "text" : "attachment",
      body: hasBody ? input.body! : null,
      parentMessageId: input.parentMessageId ?? null,
      replyToMessageId: input.replyToMessageId ?? null,
    })
    .returning();

  if (!message) {
    throw new ApiError({
      statusCode: BAD_REQUEST,
      message: API_MESSAGES.GENERAL.BAD_REQUEST,
    });
  }

  const now = new Date();

  if (fileIds.length > 0) {
    await database.insert(ChatMessageAttachmentTable).values(
      fileIds.map((fileId, index) => ({
        messageId: message.id,
        fileId,
        position: index,
      }))
    );
  }

  await database
    .update(ChatRoomTable)
    .set({ lastMessageAt: now })
    .where(eq(ChatRoomTable.id, input.roomId));

  if (input.parentMessageId) {
    await database
      .update(ChatMessageTable)
      .set({
        threadReplyCount: sql`${ChatMessageTable.threadReplyCount} + 1`,
        lastReplyAt: now,
      })
      .where(eq(ChatMessageTable.id, input.parentMessageId));
  }

  await database
    .update(ChatRoomMemberTable)
    .set({ lastReadMessageId: message.id, lastReadAt: now })
    .where(
      and(
        eq(ChatRoomMemberTable.roomId, input.roomId),
        eq(ChatRoomMemberTable.userId, user.id)
      )
    );

  const [item] = await hydrateMessages(database, user.id, [
    {
      id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      type: message.type,
      body: message.body,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      editedAt: message.editedAt,
      parentMessageId: message.parentMessageId,
      replyToMessageId: message.replyToMessageId,
      threadReplyCount: message.threadReplyCount,
      lastReplyAt: message.lastReplyAt,
      senderName: user.name,
      senderImage: user.image ?? null,
    },
  ]);

  await broadcastToRoom(c.env, input.roomId, {
    type: "message",
    roomId: input.roomId,
    data: item!,
  });

  return apiResponse(c, {
    success: true,
    statusCode: OK,
    message: API_MESSAGES.CHAT.SEND_MESSAGE,
    data: item!,
  });
};

export const toggleReactionHandler: ApiRouteHandler<
  ToggleReactionRouteType
> = async (c) => {
  const input = c.req.valid("json");
  const user = c.get("user");

  const database = createDrizzleClient(c.env.DB);

  const [message] = await database
    .select({ id: ChatMessageTable.id, roomId: ChatMessageTable.roomId })
    .from(ChatMessageTable)
    .where(eq(ChatMessageTable.id, input.messageId))
    .limit(1);

  if (!message) {
    throw new ApiError({
      statusCode: NOT_FOUND,
      message: API_MESSAGES.CHAT.MESSAGE_NOT_FOUND,
    });
  }

  const membership = await getRoomMembership(database, message.roomId, user.id);

  if (!membership) {
    throw new ApiError({
      statusCode: FORBIDDEN,
      message: API_MESSAGES.CHAT.NOT_A_MEMBER,
    });
  }

  const [existing] = await database
    .select({ id: ChatMessageReactionTable.id })
    .from(ChatMessageReactionTable)
    .where(
      and(
        eq(ChatMessageReactionTable.messageId, input.messageId),
        eq(ChatMessageReactionTable.userId, user.id),
        eq(ChatMessageReactionTable.emoji, input.emoji)
      )
    )
    .limit(1);

  if (existing) {
    await database
      .delete(ChatMessageReactionTable)
      .where(eq(ChatMessageReactionTable.id, existing.id));
  } else {
    await database.insert(ChatMessageReactionTable).values({
      messageId: input.messageId,
      userId: user.id,
      emoji: input.emoji,
    });
  }

  const [row] = (await database
    .select({
      id: ChatMessageTable.id,
      roomId: ChatMessageTable.roomId,
      senderId: ChatMessageTable.senderId,
      type: ChatMessageTable.type,
      body: ChatMessageTable.body,
      createdAt: ChatMessageTable.createdAt,
      updatedAt: ChatMessageTable.updatedAt,
      editedAt: ChatMessageTable.editedAt,
      parentMessageId: ChatMessageTable.parentMessageId,
      replyToMessageId: ChatMessageTable.replyToMessageId,
      threadReplyCount: ChatMessageTable.threadReplyCount,
      lastReplyAt: ChatMessageTable.lastReplyAt,
      senderName: UserTable.name,
      senderImage: UserTable.image,
    })
    .from(ChatMessageTable)
    .leftJoin(UserTable, eq(UserTable.id, ChatMessageTable.senderId))
    .where(eq(ChatMessageTable.id, input.messageId))
    .limit(1)) as Array<ChatMessageRow>;

  const [item] = await hydrateMessages(database, user.id, row ? [row] : []);

  if (item) {
    await broadcastToRoom(c.env, message.roomId, {
      type: "reaction",
      roomId: message.roomId,
      data: item,
    });
  }

  return apiResponse(c, {
    success: true,
    statusCode: OK,
    message: API_MESSAGES.CHAT.TOGGLE_REACTION,
    data: item!,
  });
};

export const markRoomReadHandler: ApiRouteHandler<
  MarkRoomReadRouteType
> = async (c) => {
  const input = c.req.valid("json");
  const user = c.get("user");

  const database = createDrizzleClient(c.env.DB);

  const membership = await getRoomMembership(database, input.roomId, user.id);

  if (!membership) {
    throw new ApiError({
      statusCode: FORBIDDEN,
      message: API_MESSAGES.CHAT.NOT_A_MEMBER,
    });
  }

  const [message] = await database
    .select({ id: ChatMessageTable.id, createdAt: ChatMessageTable.createdAt })
    .from(ChatMessageTable)
    .where(
      and(
        eq(ChatMessageTable.id, input.messageId),
        eq(ChatMessageTable.roomId, input.roomId)
      )
    )
    .limit(1);

  if (!message) {
    throw new ApiError({
      statusCode: NOT_FOUND,
      message: API_MESSAGES.CHAT.MESSAGE_NOT_FOUND,
    });
  }

  if (membership.lastReadMessageId) {
    const [currentRead] = await database
      .select({
        id: ChatMessageTable.id,
        createdAt: ChatMessageTable.createdAt,
      })
      .from(ChatMessageTable)
      .where(eq(ChatMessageTable.id, membership.lastReadMessageId))
      .limit(1);

    if (currentRead && isReadAhead(currentRead, message)) {
      return apiResponse(c, {
        success: true,
        statusCode: OK,
        message: API_MESSAGES.CHAT.MARK_READ,
        data: null,
      });
    }
  }

  const readAt = new Date();

  await database
    .update(ChatRoomMemberTable)
    .set({ lastReadMessageId: input.messageId, lastReadAt: readAt })
    .where(
      and(
        eq(ChatRoomMemberTable.roomId, input.roomId),
        eq(ChatRoomMemberTable.userId, user.id)
      )
    );

  await broadcastToRoom(c.env, input.roomId, {
    type: "read",
    roomId: input.roomId,
    data: {
      userId: user.id,
      messageId: input.messageId,
      lastReadAt: readAt.toISOString(),
    },
  });

  return apiResponse(c, {
    success: true,
    statusCode: OK,
    message: API_MESSAGES.CHAT.MARK_READ,
    data: null,
  });
};

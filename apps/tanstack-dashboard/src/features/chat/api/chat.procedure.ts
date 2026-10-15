import { API_MESSAGES } from "#/constants/apiMessage";
import { getRoom, getRoomMembership } from "#/features/chat/chat.guard";
import { authMiddleware } from "#/server/middleware/auth.middleware";
import { errorMiddleware } from "#/server/middleware/error.middleware";
import type { ORPCContext } from "#/types/orpc.types";
import { implement } from "@orpc/server";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  isNull,
  lt,
  ne,
  or,
  sql,
} from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";

import {
  ChatMessageTable,
  ChatRoomMemberTable,
  ChatRoomTable,
  FileTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import type { UpdateChatRoom } from "@workspace/drizzle/schemas";
import { hydrateMessages } from "@workspace/lib/chat";
import { apiResponse } from "@workspace/lib/utils";

import { chatContract } from "./chat.contract";

export const chatImpl = implement(chatContract)
  .$context<ORPCContext>()
  .use(authMiddleware)
  .use(errorMiddleware);

export const listConversationProcedure = chatImpl.listConversation.handler(
  async ({ context, input }) => {
    const userId = context.user.id;

    const roomRows = await context.db
      .select({
        id: ChatRoomTable.id,
        name: ChatRoomTable.name,
        type: ChatRoomTable.type,
        isArchived: ChatRoomTable.isArchived,
        lastMessageAt: ChatRoomTable.lastMessageAt,
        imageFileId: ChatRoomTable.imageFileId,
      })
      .from(ChatRoomMemberTable)
      .innerJoin(
        ChatRoomTable,
        eq(ChatRoomTable.id, ChatRoomMemberTable.roomId)
      )
      .where(eq(ChatRoomMemberTable.userId, userId));

    if (roomRows.length === 0) {
      return apiResponse(API_MESSAGES.CHAT.GET_ROOMS, []);
    }

    const roomIds = roomRows.map((row) => row.id);
    const imageFileIds = roomRows
      .map((row) => row.imageFileId)
      .filter((id): id is string => Boolean(id));

    const [
      memberCounts,
      otherMembers,
      lastMessages,
      unreadCounts,
      imageFiles,
      myMemberships,
    ] = await Promise.all([
      context.db
        .select({
          roomId: ChatRoomMemberTable.roomId,
          count: count(),
        })
        .from(ChatRoomMemberTable)
        .where(inArray(ChatRoomMemberTable.roomId, roomIds))
        .groupBy(ChatRoomMemberTable.roomId),
      context.db
        .select({
          roomId: ChatRoomMemberTable.roomId,
          userId: UserTable.id,
          name: UserTable.name,
          image: UserTable.image,
        })
        .from(ChatRoomMemberTable)
        .innerJoin(UserTable, eq(UserTable.id, ChatRoomMemberTable.userId))
        .where(
          and(
            inArray(ChatRoomMemberTable.roomId, roomIds),
            ne(ChatRoomMemberTable.userId, userId)
          )
        ),
      context.db
        .select({
          roomId: ChatMessageTable.roomId,
          id: ChatMessageTable.id,
          body: ChatMessageTable.body,
          type: ChatMessageTable.type,
          senderId: ChatMessageTable.senderId,
          senderName: UserTable.name,
          createdAt: ChatMessageTable.createdAt,
          rn: sql<number>`row_number() over (partition by ${ChatMessageTable.roomId} order by ${ChatMessageTable.createdAt} desc, ${ChatMessageTable.id} desc)`.as(
            "rn"
          ),
        })
        .from(ChatMessageTable)
        .leftJoin(UserTable, eq(UserTable.id, ChatMessageTable.senderId))
        .where(
          and(
            inArray(ChatMessageTable.roomId, roomIds),
            isNull(ChatMessageTable.parentMessageId)
          )
        )
        .as("last_message_sq"),
      context.db
        .select({
          roomId: ChatMessageTable.roomId,
          count: count(),
        })
        .from(ChatMessageTable)
        .innerJoin(
          ChatRoomMemberTable,
          and(
            eq(ChatRoomMemberTable.roomId, ChatMessageTable.roomId),
            eq(ChatRoomMemberTable.userId, userId)
          )
        )
        .where(
          and(
            inArray(ChatMessageTable.roomId, roomIds),
            isNull(ChatMessageTable.parentMessageId),
            or(
              isNull(ChatMessageTable.senderId),
              ne(ChatMessageTable.senderId, userId)
            ),
            or(
              isNull(ChatRoomMemberTable.lastReadAt),
              gt(ChatMessageTable.createdAt, ChatRoomMemberTable.lastReadAt)
            )
          )
        )
        .groupBy(ChatMessageTable.roomId),
      imageFileIds.length > 0
        ? context.db
            .select({ id: FileTable.id, url: FileTable.url })
            .from(FileTable)
            .where(inArray(FileTable.id, imageFileIds))
        : Promise.resolve([] as Array<{ id: string; url: string }>),
      context.db
        .select({
          roomId: ChatRoomMemberTable.roomId,
          role: ChatRoomMemberTable.role,
          isMuted: ChatRoomMemberTable.isMuted,
        })
        .from(ChatRoomMemberTable)
        .where(
          and(
            inArray(ChatRoomMemberTable.roomId, roomIds),
            eq(ChatRoomMemberTable.userId, userId)
          )
        ),
    ]);

    const lastMessageRows = await context.db
      .select()
      .from(lastMessages)
      .where(eq(lastMessages.rn, 1));

    const memberCountMap = new Map(
      memberCounts.map((row) => [row.roomId, row.count])
    );
    const unreadMap = new Map(
      unreadCounts.map((row) => [row.roomId, row.count])
    );
    const imageFileMap = new Map(imageFiles.map((file) => [file.id, file.url]));
    const myMembershipMap = new Map(
      myMemberships.map((row) => [row.roomId, row])
    );
    const lastMessageMap = new Map(
      lastMessageRows.map((row) => [row.roomId, row])
    );
    const otherMemberMap = new Map<
      string,
      { userId: string; name: string; image: string | null }
    >();

    for (const member of otherMembers) {
      if (!otherMemberMap.has(member.roomId)) {
        otherMemberMap.set(member.roomId, member);
      }
    }

    const summaries = roomRows.map(
      ({ id, name, type, imageFileId, isArchived, lastMessageAt }) => {
        const other = type === "direct" ? otherMemberMap.get(id) : undefined;
        const displayName =
          type === "direct"
            ? (other?.name ?? "Direct message")
            : (name ?? "Group");
        const displayImage =
          type === "direct"
            ? (other?.image ?? null)
            : imageFileId
              ? (imageFileMap.get(imageFileId) ?? null)
              : null;

        const lastMessageRow = lastMessageMap.get(id);
        const myMembership = myMembershipMap.get(id);

        return {
          roomId: id,
          type,
          name,
          displayName,
          displayImage,
          isArchived,
          lastMessageAt,
          unreadCount: unreadMap.get(id) ?? 0,
          memberCount: memberCountMap.get(id) ?? 0,
          myRole: myMembership?.role ?? "member",
          isMuted: myMembership?.isMuted ?? false,
          lastMessage: lastMessageRow
            ? {
                id: lastMessageRow.id,
                body: lastMessageRow.body,
                type: lastMessageRow.type,
                senderId: lastMessageRow.senderId,
                senderName: lastMessageRow.senderName,
                createdAt: lastMessageRow.createdAt,
              }
            : null,
        };
      }
    );

    const search = input.search;

    const filtered = summaries
      .filter((summary) =>
        search ? summary.displayName.toLowerCase().includes(search) : true
      )
      .sort(
        (a, b) =>
          (b.lastMessageAt?.getTime() ?? 0) - (a.lastMessageAt?.getTime() ?? 0)
      );

    return apiResponse(API_MESSAGES.CHAT.GET_ROOMS, filtered);
  }
);

export const createRoomProcedure = chatImpl.createRoom.handler(
  async ({ context, input, errors }) => {
    const userId = context.user.id;
    const otherUserId = input.userId;

    if (otherUserId === userId) {
      throw errors.BAD_REQUEST();
    }

    const [otherUser] = await context.db
      .select({ id: UserTable.id })
      .from(UserTable)
      .where(eq(UserTable.id, otherUserId))
      .limit(1);

    if (!otherUser) {
      throw errors.USER_NOT_FOUND();
    }

    const myDirectRoomIds = context.db
      .select({ roomId: ChatRoomMemberTable.roomId })
      .from(ChatRoomMemberTable)
      .innerJoin(
        ChatRoomTable,
        eq(ChatRoomTable.id, ChatRoomMemberTable.roomId)
      )
      .where(
        and(
          eq(ChatRoomMemberTable.userId, userId),
          eq(ChatRoomTable.type, "direct")
        )
      );

    const [existing] = await context.db
      .select({ roomId: ChatRoomMemberTable.roomId })
      .from(ChatRoomMemberTable)
      .where(
        and(
          eq(ChatRoomMemberTable.userId, otherUserId),
          inArray(ChatRoomMemberTable.roomId, myDirectRoomIds)
        )
      )
      .limit(1);

    if (existing) {
      return apiResponse(API_MESSAGES.CHAT.CREATE_ROOM, {
        id: existing.roomId,
      });
    }

    const roomId = crypto.randomUUID();

    const statements: [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]] = [
      context.db.insert(ChatRoomTable).values({
        id: roomId,
        type: "direct",
        createdBy: userId,
      }),
      context.db.insert(ChatRoomMemberTable).values([
        { roomId, userId, role: "owner" },
        { roomId, userId: otherUserId, role: "member" },
      ]),
    ];

    await context.db.batch(statements);

    return apiResponse(API_MESSAGES.CHAT.CREATE_ROOM, { id: roomId });
  }
);

export const createGroupProcedure = chatImpl.createGroup.handler(
  async ({ context, input, errors }) => {
    const userId = context.user.id;

    const memberIds = [...new Set(input.memberIds)].filter(
      (id) => id !== userId
    );

    if (memberIds.length < 1) {
      throw errors.BAD_REQUEST();
    }

    const existingMembers = await context.db
      .select({ id: UserTable.id })
      .from(UserTable)
      .where(inArray(UserTable.id, memberIds));

    if (existingMembers.length !== memberIds.length) {
      throw errors.USER_NOT_FOUND();
    }

    let imageFileId: string | null = null;

    if (input.imageFileId) {
      const [file] = await context.db
        .select({ id: FileTable.id })
        .from(FileTable)
        .where(
          and(
            eq(FileTable.id, input.imageFileId),
            eq(FileTable.uploadedBy, userId),
            isNull(FileTable.deletedAt)
          )
        )
        .limit(1);

      if (!file) {
        throw errors.ATTACHMENT_INVALID();
      }

      imageFileId = input.imageFileId;
    }

    const roomId = crypto.randomUUID();

    const statements: [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]] = [
      context.db.insert(ChatRoomTable).values({
        id: roomId,
        type: "group",
        name: input.name,
        imageFileId,
        createdBy: userId,
      }),
      context.db.insert(ChatRoomMemberTable).values([
        { roomId, userId, role: "owner" },
        ...memberIds.map((memberId) => ({
          roomId,
          userId: memberId,
          role: "member" as const,
        })),
      ]),
    ];

    if (imageFileId) {
      statements.push(
        context.db
          .update(FileTable)
          .set({ entityId: roomId })
          .where(eq(FileTable.id, imageFileId))
      );
    }

    await context.db.batch(statements);

    return apiResponse(API_MESSAGES.CHAT.CREATE_GROUP, { id: roomId });
  }
);

export const updateGroupProcedure = chatImpl.updateGroup.handler(
  async ({ context, input, errors }) => {
    const userId = context.user.id;

    const memberIds = [...new Set(input.memberIds)].filter(
      (id) => id !== userId
    );

    if (memberIds.length < 1) {
      throw errors.BAD_REQUEST();
    }

    const room = await getRoom(context.db, input.roomId);

    if (!room) {
      throw errors.ROOM_NOT_FOUND();
    }

    if (room.type !== "group") {
      throw errors.BAD_REQUEST();
    }

    const membership = await getRoomMembership(
      context.db,
      input.roomId,
      userId
    );

    if (!membership) {
      throw errors.NOT_A_MEMBER();
    }

    if (membership.role !== "owner" && membership.role !== "admin") {
      throw errors.NOT_ALLOWED();
    }

    const updatedData: UpdateChatRoom = {};

    if (input.name !== undefined) {
      updatedData.name = input.name;
    }

    const currentMembers = await context.db
      .select({
        userId: ChatRoomMemberTable.userId,
        role: ChatRoomMemberTable.role,
      })
      .from(ChatRoomMemberTable)
      .where(
        and(
          eq(ChatRoomMemberTable.roomId, room.id),
          ne(ChatRoomMemberTable.userId, userId)
        )
      );

    const currentMemberIds = new Set(currentMembers.map((m) => m.userId));
    const desiredMemberIds = new Set(memberIds);

    const addedMemberIds = memberIds.filter((id) => !currentMemberIds.has(id));
    const removedMembers = currentMembers.filter(
      (member) => !desiredMemberIds.has(member.userId)
    );

    if (addedMemberIds.length > 0) {
      const existingMembers = await context.db
        .select({ id: UserTable.id })
        .from(UserTable)
        .where(inArray(UserTable.id, addedMemberIds));

      if (existingMembers.length !== addedMemberIds.length) {
        throw errors.USER_NOT_FOUND();
      }
    }

    const isOwner = membership.role === "owner";
    const hasForbiddenRemoval = removedMembers.some(
      (member) =>
        member.role === "owner" || (member.role === "admin" && !isOwner)
    );

    if (hasForbiddenRemoval) {
      throw errors.NOT_ALLOWED();
    }

    const statements: BatchItem<"sqlite">[] = [];

    if (input.imageFileId) {
      const [file] = await context.db
        .select({ id: FileTable.id })
        .from(FileTable)
        .where(
          and(
            eq(FileTable.id, input.imageFileId),
            eq(FileTable.uploadedBy, userId),
            isNull(FileTable.deletedAt)
          )
        )
        .limit(1);

      if (!file) {
        throw errors.ATTACHMENT_INVALID();
      }

      statements.push(
        context.db
          .update(FileTable)
          .set({ entityId: room.id })
          .where(eq(FileTable.id, file.id))
      );

      updatedData.imageFileId = file.id;
    }

    if (Object.keys(updatedData).length > 0) {
      statements.push(
        context.db
          .update(ChatRoomTable)
          .set(updatedData)
          .where(eq(ChatRoomTable.id, room.id))
      );
    }

    if (addedMemberIds.length > 0) {
      statements.push(
        context.db.insert(ChatRoomMemberTable).values(
          addedMemberIds.map((memberId) => ({
            roomId: room.id,
            userId: memberId,
            role: "member" as const,
          }))
        )
      );
    }

    if (removedMembers.length > 0) {
      statements.push(
        context.db.delete(ChatRoomMemberTable).where(
          and(
            eq(ChatRoomMemberTable.roomId, room.id),
            inArray(
              ChatRoomMemberTable.userId,
              removedMembers.map((member) => member.userId)
            )
          )
        )
      );
    }

    if (statements.length > 0) {
      await context.db.batch(
        statements as [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]]
      );
    }

    return apiResponse(API_MESSAGES.CHAT.UPDATE_GROUP, {
      id: room.id,
    });
  }
);

export const deleteGroupProcedure = chatImpl.deleteGroup.handler(
  async ({ context, input, errors }) => {
    const room = await getRoom(context.db, input.roomId);

    if (!room) {
      throw errors.ROOM_NOT_FOUND();
    }

    if (room.type !== "group") {
      throw errors.BAD_REQUEST();
    }

    const membership = await getRoomMembership(
      context.db,
      input.roomId,
      context.user.id
    );

    if (!membership) {
      throw errors.NOT_A_MEMBER();
    }

    if (membership.role !== "owner") {
      throw errors.NOT_ALLOWED();
    }

    const statements: [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]] = [
      context.db.delete(ChatRoomTable).where(eq(ChatRoomTable.id, room.id)),
    ];

    if (room.imageFileId) {
      statements.push(
        context.db.delete(FileTable).where(eq(FileTable.id, room.imageFileId))
      );
    }

    await context.db.batch(statements);

    return apiResponse(API_MESSAGES.CHAT.DELETE_GROUP, null);
  }
);

export const setRoomMutedProcedure = chatImpl.setRoomMuted.handler(
  async ({ context, input, errors }) => {
    const membership = await getRoomMembership(
      context.db,
      input.roomId,
      context.user.id
    );

    if (!membership) {
      throw errors.NOT_A_MEMBER();
    }

    await context.db
      .update(ChatRoomMemberTable)
      .set({ isMuted: input.isMuted })
      .where(
        and(
          eq(ChatRoomMemberTable.roomId, input.roomId),
          eq(ChatRoomMemberTable.userId, context.user.id)
        )
      );

    return apiResponse(API_MESSAGES.CHAT.SET_ROOM_MUTED, {
      id: input.roomId,
      isMuted: input.isMuted,
    });
  }
);

export const roomDetailsProcedure = chatImpl.roomDetails.handler(
  async ({ context, input, errors }) => {
    const room = await getRoom(context.db, input.roomId);

    if (!room) {
      throw errors.ROOM_NOT_FOUND();
    }

    const membership = await getRoomMembership(
      context.db,
      input.roomId,
      context.user.id
    );

    if (!membership) {
      throw errors.NOT_A_MEMBER();
    }

    const memberRows = await context.db
      .select({
        userId: ChatRoomMemberTable.userId,
        name: UserTable.name,
        image: UserTable.image,
        role: ChatRoomMemberTable.role,
        isMuted: ChatRoomMemberTable.isMuted,
        lastReadAt: ChatRoomMemberTable.lastReadAt,
        lastReadMessageId: ChatRoomMemberTable.lastReadMessageId,
      })
      .from(ChatRoomMemberTable)
      .innerJoin(UserTable, eq(UserTable.id, ChatRoomMemberTable.userId))
      .where(eq(ChatRoomMemberTable.roomId, input.roomId));

    const roomImage = room.imageFileId
      ? await context.db
          .select({ url: FileTable.url })
          .from(FileTable)
          .where(eq(FileTable.id, room.imageFileId))
          .limit(1)
      : [];

    const other =
      room.type === "direct"
        ? memberRows.find((member) => member.userId !== context.user.id)
        : undefined;

    const displayName =
      room.type === "direct"
        ? (other?.name ?? "Direct message")
        : (room.name ?? "Group");
    const displayImage =
      room.type === "direct"
        ? (other?.image ?? null)
        : (roomImage[0]?.url ?? null);

    return apiResponse(API_MESSAGES.CHAT.GET_ROOM, {
      id: room.id,
      type: room.type,
      name: room.name,
      description: room.description,
      displayName,
      displayImage,
      image: roomImage[0]?.url ?? null,
      createdBy: room.createdBy,
      isArchived: room.isArchived,
      lastMessageAt: room.lastMessageAt,
      createdAt: room.createdAt,
      members: memberRows,
      myMembership: {
        role: membership.role,
        isMuted: membership.isMuted,
        lastReadMessageId: membership.lastReadMessageId,
        lastReadAt: membership.lastReadAt,
      },
    });
  }
);

export const listMessagesProcedure = chatImpl.listMessages.handler(
  async ({ context, input, errors }) => {
    const membership = await getRoomMembership(
      context.db,
      input.roomId,
      context.user.id
    );

    if (!membership) {
      throw errors.NOT_A_MEMBER();
    }

    const conditions = [eq(ChatMessageTable.roomId, input.roomId)];

    if (input.parentMessageId) {
      conditions.push(
        eq(ChatMessageTable.parentMessageId, input.parentMessageId)
      );
    } else {
      conditions.push(isNull(ChatMessageTable.parentMessageId));
    }

    const isForward = Boolean(input.after) || Boolean(input.fromOldest);

    if (input.after) {
      const [afterMessage] = await context.db
        .select({
          createdAt: ChatMessageTable.createdAt,
          id: ChatMessageTable.id,
        })
        .from(ChatMessageTable)
        .where(eq(ChatMessageTable.id, input.after))
        .limit(1);

      if (!afterMessage) {
        return apiResponse(API_MESSAGES.CHAT.GET_MESSAGES, {
          items: [],
          olderCursor: null,
          newerCursor: null,
        });
      }

      conditions.push(
        or(
          gt(ChatMessageTable.createdAt, afterMessage.createdAt),
          and(
            eq(ChatMessageTable.createdAt, afterMessage.createdAt),
            input.inclusive
              ? gte(ChatMessageTable.id, afterMessage.id)
              : gt(ChatMessageTable.id, afterMessage.id)
          )
        )!
      );
    } else if (input.before) {
      const [beforeMessage] = await context.db
        .select({
          createdAt: ChatMessageTable.createdAt,
          id: ChatMessageTable.id,
        })
        .from(ChatMessageTable)
        .where(eq(ChatMessageTable.id, input.before))
        .limit(1);

      if (beforeMessage) {
        conditions.push(
          or(
            lt(ChatMessageTable.createdAt, beforeMessage.createdAt),
            and(
              eq(ChatMessageTable.createdAt, beforeMessage.createdAt),
              lt(ChatMessageTable.id, beforeMessage.id)
            )
          )!
        );
      }
    }

    const rows = await context.db
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
      .where(and(...conditions))
      .orderBy(
        isForward
          ? asc(ChatMessageTable.createdAt)
          : desc(ChatMessageTable.createdAt),
        isForward ? asc(ChatMessageTable.id) : desc(ChatMessageTable.id)
      )
      .limit(input.limit);

    const isFull = rows.length === input.limit;
    const hydrated = await hydrateMessages(
      context.db,
      context.user.id,
      isForward ? rows : [...rows].reverse()
    );
    const firstId = hydrated[0]?.id ?? null;
    const lastId = hydrated.at(-1)?.id ?? null;

    const olderCursor = isForward
      ? input.fromOldest
        ? null
        : firstId
      : isFull
        ? firstId
        : null;
    const newerCursor = isForward
      ? isFull
        ? lastId
        : null
      : input.before
        ? lastId
        : null;

    return apiResponse(API_MESSAGES.CHAT.GET_MESSAGES, {
      items: hydrated,
      olderCursor,
      newerCursor,
    });
  }
);

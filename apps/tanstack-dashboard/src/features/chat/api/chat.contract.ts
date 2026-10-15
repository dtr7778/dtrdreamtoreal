import { API_MESSAGES } from "#/constants/apiMessage";
import { baseContract } from "#/server/orpc.contract-base";
import type { InferContractRouterType } from "#/types/orpc.types";
import z from "zod";

import {
  ChatMemberRoleEnumSchema,
  ChatMessageTypeEnumSchema,
  ChatRoomTypeEnumSchema,
} from "@workspace/drizzle/zod-db-enums";
import { chatMemberSchema, chatMessageItemSchema } from "@workspace/lib/chat";
import { tiptapDocSchema } from "@workspace/lib/tiptap";
import { apiOutputSchema } from "@workspace/lib/zod-schemas";

import { createGroupSchema, updateGroupSchema } from "../chat.schema";

const chatBaseContract = baseContract.errors({
  ROOM_NOT_FOUND: {
    status: 404,
    success: false,
    message: API_MESSAGES.CHAT.ROOM_NOT_FOUND,
  },
  MESSAGE_NOT_FOUND: {
    status: 404,
    success: false,
    message: API_MESSAGES.CHAT.MESSAGE_NOT_FOUND,
  },
  NOT_A_MEMBER: {
    status: 403,
    success: false,
    message: API_MESSAGES.CHAT.NOT_A_MEMBER,
  },
  USER_NOT_FOUND: {
    status: 404,
    success: false,
    message: API_MESSAGES.USER.NOT_FOUND,
  },
  NOT_ALLOWED: {
    status: 403,
    success: false,
    message: API_MESSAGES.CHAT.NOT_ALLOWED,
  },
  ATTACHMENT_INVALID: {
    status: 422,
    success: false,
    message: API_MESSAGES.CHAT.ATTACHMENT_INVALID,
  },
});

const tags = ["Chat"] as const;

const listConversationContract = chatBaseContract
  .route({
    method: "GET",
    path: "/chat/conversations",
    description: "List conversations for the current user",
    tags,
  })
  .input(
    z.object({
      search: z.string().trim().toLowerCase().optional(),
    })
  )
  .output(
    apiOutputSchema(
      z.array(
        z.object({
          roomId: z.uuid(),
          type: ChatRoomTypeEnumSchema,
          name: z.string().nullable(),
          displayName: z.string(),
          displayImage: z.string().nullable(),
          isArchived: z.boolean(),
          lastMessageAt: z.date().nullable(),
          unreadCount: z.number(),
          memberCount: z.number(),
          myRole: ChatMemberRoleEnumSchema,
          isMuted: z.boolean(),
          lastMessage: z
            .object({
              id: z.uuid(),
              body: tiptapDocSchema.nullable(),
              type: ChatMessageTypeEnumSchema,
              senderId: z.string().nullable(),
              senderName: z.string().nullable(),
              createdAt: z.date(),
            })
            .nullable(),
        })
      )
    )
  );
export type ListConversationContractType = InferContractRouterType<
  typeof listConversationContract
>;

const createRoomContract = chatBaseContract
  .route({
    method: "POST",
    path: "/chat/rooms/create",
    description: "Start a direct conversation with a user",
    tags,
  })
  .input(
    z.object({
      userId: z.uuid(),
    })
  )
  .output(apiOutputSchema(z.object({ id: z.uuid() })));
export type CreateRoomContractType = InferContractRouterType<
  typeof createRoomContract
>;

const createGroupContract = chatBaseContract
  .route({
    method: "POST",
    path: "/chat/rooms/group/create",
    description: "Create a group conversation",
    tags,
  })
  .input(
    createGroupSchema.extend({
      imageFileId: z.uuid().nullish(),
    })
  )
  .output(apiOutputSchema(z.object({ id: z.uuid() })));
export type CreateGroupContractType = InferContractRouterType<
  typeof createGroupContract
>;

const updateGroupContract = chatBaseContract
  .route({
    method: "POST",
    path: "/chat/rooms/group/update",
    description: "Update a group conversation's details",
    tags,
  })
  .input(
    updateGroupSchema.extend({
      imageFileId: z.uuid().nullish(),
    })
  )
  .output(
    apiOutputSchema(
      z.object({
        id: z.uuid(),
      })
    )
  );
export type UpdateGroupContractType = InferContractRouterType<
  typeof updateGroupContract
>;

const deleteGroupContract = chatBaseContract
  .route({
    method: "POST",
    path: "/chat/rooms/group/delete",
    description: "Delete a group conversation",
    tags,
  })
  .input(
    z.object({
      roomId: z.uuid(),
    })
  )
  .output(apiOutputSchema(z.null()));
export type DeleteGroupContractType = InferContractRouterType<
  typeof deleteGroupContract
>;

const setRoomMutedContract = chatBaseContract
  .route({
    method: "POST",
    path: "/chat/rooms/mute",
    description: "Mute or unmute notifications for a conversation",
    tags,
  })
  .input(
    z.object({
      roomId: z.uuid(),
      isMuted: z.boolean(),
    })
  )
  .output(apiOutputSchema(z.object({ id: z.uuid(), isMuted: z.boolean() })));
export type SetRoomMutedContractType = InferContractRouterType<
  typeof setRoomMutedContract
>;

const roomDetailsContract = chatBaseContract
  .route({
    method: "GET",
    path: "/chat/rooms/details",
    description: "Get a conversation with its members",
    tags,
  })
  .input(
    z.object({
      roomId: z.uuid(),
    })
  )
  .output(
    apiOutputSchema(
      z.object({
        id: z.string(),
        type: ChatRoomTypeEnumSchema,
        name: z.string().nullable(),
        description: z.string().nullable(),
        displayName: z.string(),
        displayImage: z.string().nullable(),
        image: z.string().nullable(),
        createdBy: z.string().nullable(),
        isArchived: z.boolean(),
        lastMessageAt: z.date().nullable(),
        createdAt: z.date(),
        members: z.array(chatMemberSchema),
        myMembership: z.object({
          role: ChatMemberRoleEnumSchema,
          isMuted: z.boolean(),
          lastReadMessageId: z.string().nullable(),
          lastReadAt: z.date().nullable(),
        }),
      })
    )
  );
export type RoomDetailsContractType = InferContractRouterType<
  typeof roomDetailsContract
>;

const listMessagesContract = chatBaseContract
  .route({
    method: "GET",
    path: "/chat/messages",
    description: "List main timeline or thread messages (cursor paginated)",
    tags,
  })
  .input(
    z.object({
      roomId: z.uuid(),
      parentMessageId: z.uuid().nullish(),
      before: z.uuid().nullish(),
      after: z.uuid().nullish(),
      inclusive: z.boolean().optional(),
      fromOldest: z.boolean().optional(),
      limit: z.number().int().min(1).max(100).default(30),
    })
  )
  .output(
    apiOutputSchema(
      z.object({
        items: z.array(chatMessageItemSchema),
        olderCursor: z.string().nullable(),
        newerCursor: z.string().nullable(),
      })
    )
  );
export type ListMessagesContractType = InferContractRouterType<
  typeof listMessagesContract
>;

export const chatContract = {
  listConversation: listConversationContract,
  createRoom: createRoomContract,
  createGroup: createGroupContract,
  updateGroup: updateGroupContract,
  deleteGroup: deleteGroupContract,
  setRoomMuted: setRoomMutedContract,
  roomDetails: roomDetailsContract,
  listMessages: listMessagesContract,
};

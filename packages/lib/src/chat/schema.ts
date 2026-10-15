import z from "zod";

import {
  ChatMemberRoleEnumSchema,
  ChatMessageTypeEnumSchema,
} from "@workspace/drizzle/zod-db-enums";

import { tiptapDocSchema } from "../tiptap";

export const chatReactionSummarySchema = z.object({
  emoji: z.string(),
  count: z.number(),
  reactedByMe: z.boolean(),
  userIds: z.array(z.string()),
});
export type ChatReactionSummaryType = z.infer<typeof chatReactionSummarySchema>;

export const chatAttachmentSchema = z.object({
  id: z.string(),
  fileId: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  size: z.number(),
  url: z.string(),
  position: z.number(),
});
export type ChatAttachmentType = z.infer<typeof chatAttachmentSchema>;

export const chatReplyPreviewSchema = z.object({
  id: z.string(),
  body: tiptapDocSchema.nullable(),
  senderName: z.string().nullable(),
  type: ChatMessageTypeEnumSchema,
});
export type ChatReplyPreviewType = z.infer<typeof chatReplyPreviewSchema>;

export const chatSenderSchema = z.object({
  id: z.string().nullable(),
  name: z.string().nullable(),
  image: z.string().nullable(),
});
export type ChatSenderType = z.infer<typeof chatSenderSchema>;

export const chatMessageItemSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  sender: chatSenderSchema,
  type: ChatMessageTypeEnumSchema,
  body: tiptapDocSchema.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  editedAt: z.date().nullable(),
  parentMessageId: z.string().nullable(),
  replyToMessageId: z.string().nullable(),
  replyTo: chatReplyPreviewSchema.nullable(),
  threadReplyCount: z.number(),
  lastReplyAt: z.date().nullable(),
  reactions: z.array(chatReactionSummarySchema),
  attachments: z.array(chatAttachmentSchema),
});
export type ChatMessageItemType = z.infer<typeof chatMessageItemSchema>;

export const chatMemberSchema = z.object({
  userId: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  role: ChatMemberRoleEnumSchema,
  isMuted: z.boolean(),
  lastReadAt: z.date().nullable(),
  lastReadMessageId: z.string().nullable(),
});
export type ChatMemberType = z.infer<typeof chatMemberSchema>;

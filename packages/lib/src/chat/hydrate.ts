import { asc, eq, inArray } from "drizzle-orm";

import type { DatabaseType } from "@workspace/drizzle/client";
import {
  ChatMessageAttachmentTable,
  ChatMessageReactionTable,
  ChatMessageTable,
  FileTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import type { ChatMessageTypeEnumType } from "@workspace/drizzle/zod-db-enums";

import type { TiptapDoc } from "../tiptap";
import type { ChatMessageItemType, ChatReactionSummaryType } from "./schema";

export type ChatMessageRow = {
  id: string;
  roomId: string;
  senderId: string | null;
  type: ChatMessageTypeEnumType;
  body: TiptapDoc | null;
  createdAt: Date;
  updatedAt: Date;
  editedAt: Date | null;
  parentMessageId: string | null;
  replyToMessageId: string | null;
  threadReplyCount: number;
  lastReplyAt: Date | null;
  senderName: string | null;
  senderImage: string | null;
};

function buildReactionSummaries(
  viewerId: string,
  reactions: Array<{ messageId: string; userId: string; emoji: string }>
): Map<string, Array<ChatReactionSummaryType>> {
  const byMessage = new Map<
    string,
    Map<string, { userIds: Array<string>; reactedByMe: boolean }>
  >();

  for (const reaction of reactions) {
    const emojiMap =
      byMessage.get(reaction.messageId) ??
      new Map<string, { userIds: Array<string>; reactedByMe: boolean }>();

    const entry = emojiMap.get(reaction.emoji) ?? {
      userIds: [],
      reactedByMe: false,
    };

    entry.userIds.push(reaction.userId);
    entry.reactedByMe = entry.reactedByMe || reaction.userId === viewerId;
    emojiMap.set(reaction.emoji, entry);
    byMessage.set(reaction.messageId, emojiMap);
  }

  const summaries = new Map<string, Array<ChatReactionSummaryType>>();

  for (const [messageId, emojiMap] of byMessage) {
    summaries.set(
      messageId,
      Array.from(emojiMap.entries()).map(([emoji, value]) => ({
        emoji,
        count: value.userIds.length,
        reactedByMe: value.reactedByMe,
        userIds: value.userIds,
      }))
    );
  }

  return summaries;
}

export async function hydrateMessages(
  db: DatabaseType,
  viewerId: string,
  rows: Array<ChatMessageRow>
): Promise<Array<ChatMessageItemType>> {
  if (rows.length === 0) return [];

  const messageIds = rows.map((row) => row.id);
  const replyToIds = Array.from(
    new Set(
      rows
        .map((row) => row.replyToMessageId)
        .filter((id): id is string => Boolean(id))
    )
  );

  const [attachments, reactions, replyToRows] = await Promise.all([
    db
      .select({
        id: ChatMessageAttachmentTable.id,
        messageId: ChatMessageAttachmentTable.messageId,
        fileId: ChatMessageAttachmentTable.fileId,
        position: ChatMessageAttachmentTable.position,
        filename: FileTable.filename,
        mimeType: FileTable.mimeType,
        size: FileTable.size,
        url: FileTable.url,
      })
      .from(ChatMessageAttachmentTable)
      .innerJoin(FileTable, eq(FileTable.id, ChatMessageAttachmentTable.fileId))
      .where(inArray(ChatMessageAttachmentTable.messageId, messageIds))
      .orderBy(asc(ChatMessageAttachmentTable.position)),
    db
      .select({
        messageId: ChatMessageReactionTable.messageId,
        userId: ChatMessageReactionTable.userId,
        emoji: ChatMessageReactionTable.emoji,
      })
      .from(ChatMessageReactionTable)
      .where(inArray(ChatMessageReactionTable.messageId, messageIds)),
    replyToIds.length > 0
      ? db
          .select({
            id: ChatMessageTable.id,
            body: ChatMessageTable.body,
            type: ChatMessageTable.type,
            senderName: UserTable.name,
          })
          .from(ChatMessageTable)
          .leftJoin(UserTable, eq(UserTable.id, ChatMessageTable.senderId))
          .where(inArray(ChatMessageTable.id, replyToIds))
      : Promise.resolve(
          [] as Array<{
            id: string;
            body: TiptapDoc | null;
            type: ChatMessageTypeEnumType;
            senderName: string | null;
          }>
        ),
  ]);

  const reactionSummaries = buildReactionSummaries(viewerId, reactions);
  const replyToMap = new Map(replyToRows.map((row) => [row.id, row]));

  return rows.map((row) => {
    const replyTo = row.replyToMessageId
      ? replyToMap.get(row.replyToMessageId)
      : undefined;

    return {
      id: row.id,
      roomId: row.roomId,
      sender: {
        id: row.senderId,
        name: row.senderName,
        image: row.senderImage,
      },
      type: row.type,
      body: row.body,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      editedAt: row.editedAt,
      parentMessageId: row.parentMessageId,
      replyToMessageId: row.replyToMessageId,
      replyTo: replyTo
        ? {
            id: replyTo.id,
            body: replyTo.body,
            type: replyTo.type,
            senderName: replyTo.senderName,
          }
        : null,
      threadReplyCount: row.threadReplyCount,
      lastReplyAt: row.lastReplyAt,
      reactions: reactionSummaries.get(row.id) ?? [],
      attachments: attachments
        .filter((attachment) => attachment.messageId === row.id)
        .map((attachment) => ({
          id: attachment.id,
          fileId: attachment.fileId,
          filename: attachment.filename,
          mimeType: attachment.mimeType,
          size: attachment.size,
          url: attachment.url,
          position: attachment.position,
        })),
    } satisfies ChatMessageItemType;
  });
}

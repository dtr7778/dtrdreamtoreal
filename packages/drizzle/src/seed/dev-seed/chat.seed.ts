import { faker } from "@faker-js/faker";

import type { DatabaseType } from "../../clients/drizzle-client";
import type {
  ChatMessageDataModel,
  ChatRoomDataModel,
  InsertChatMessage,
  InsertChatMessageAttachment,
  InsertChatMessageReaction,
  InsertChatRoom,
  InsertChatRoomMember,
  InsertFile,
  TiptapDoc,
  UserDataModel,
} from "../../schemas";
import {
  ChatMessageAttachmentTable,
  ChatMessageReactionTable,
  ChatMessageTable,
  ChatRoomMemberTable,
  ChatRoomTable,
  FileTable,
} from "../../schemas";
import { insertChunked, insertChunkedReturning } from "../seed-utils";
import { seedConfigs } from "../seed.config";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "🎉", "🔥", "👀", "🙌", "😮"];

const SYSTEM_EVENTS = [
  "member_joined",
  "member_left",
  "room_renamed",
  "room_created",
] as const;

const REPLY_DISTRIBUTION: Array<{ weight: number; value: number }> = [
  { weight: 6, value: 0 },
  { weight: 3, value: 1 },
  { weight: 2, value: 2 },
  { weight: 1, value: 3 },
];

type RoomPlan = {
  room: InsertChatRoom;
  memberIds: Array<string>;
  ownerId: string;
};

function textDoc(text: string): TiptapDoc {
  return {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  };
}

type MessageParams = {
  roomId: string;
  memberIds: Array<string>;
  parentMessageId: string | null;
  replyToMessageId: string | null;
  threadReplyCount: number;
  lastReplyAt: Date | null;
  allowSystem: boolean;
};

function buildDirectPlans(
  users: Array<UserDataModel>,
  count: number
): Array<RoomPlan> {
  const plans: Array<RoomPlan> = [];
  const seenPairs = new Set<string>();
  let attempts = 0;
  const maxAttempts = count * 10;

  while (plans.length < count && attempts < maxAttempts) {
    attempts += 1;

    const [first, second] = faker.helpers.arrayElements(users, 2);
    if (!first || !second || first.id === second.id) continue;

    const pairKey = [first.id, second.id].sort().join(":");
    if (seenPairs.has(pairKey)) continue;
    seenPairs.add(pairKey);

    plans.push({
      room: {
        type: "direct",
        name: null,
        description: null,
        imageFileId: null,
        createdBy: first.id,
        lastMessageAt: faker.date.recent({ days: 30 }),
        isArchived: false,
      },
      memberIds: [first.id, second.id],
      ownerId: first.id,
    });
  }

  return plans;
}

function buildGroupPlans(
  users: Array<UserDataModel>,
  count: number
): Array<RoomPlan> {
  const plans: Array<RoomPlan> = [];

  for (let i = 0; i < count; i++) {
    const memberCount = faker.number.int({
      min: 3,
      max: Math.min(8, Math.max(3, users.length)),
    });
    const members = faker.helpers.arrayElements(users, memberCount);
    const owner = members[0]!;

    plans.push({
      room: {
        type: "group",
        name: faker.helpers.arrayElement([
          `${faker.commerce.department()} Team`,
          faker.company.buzzPhrase(),
          `${faker.word.adjective()} ${faker.word.noun()} Forum`,
        ]),
        description: faker.helpers.maybe(() => faker.lorem.sentence(), {
          probability: 0.6,
        }),
        imageFileId: null,
        createdBy: owner.id,
        lastMessageAt: faker.date.recent({ days: 30 }),
        isArchived: faker.datatype.boolean(0.1),
      },
      memberIds: members.map((member) => member.id),
      ownerId: owner.id,
    });
  }

  return plans;
}

function buildRoomPlans(users: Array<UserDataModel>): Array<RoomPlan> {
  const total = seedConfigs.targets.chatRooms;
  const directCount = Math.min(
    Math.floor(total / 2),
    Math.floor(users.length / 2)
  );
  const groupCount = Math.max(0, total - directCount);

  return [
    ...buildDirectPlans(users, directCount),
    ...buildGroupPlans(users, groupCount),
  ];
}

function createMessage(params: MessageParams): InsertChatMessage {
  const {
    roomId,
    memberIds,
    parentMessageId,
    replyToMessageId,
    threadReplyCount,
    lastReplyAt,
    allowSystem,
  } = params;

  if (allowSystem && faker.datatype.boolean(0.08)) {
    const event = faker.helpers.arrayElement(SYSTEM_EVENTS);

    return {
      roomId,
      senderId: null,
      type: "system",
      body: textDoc(`System event: ${event}`),
      metadata: { event },
      parentMessageId: null,
      replyToMessageId: null,
      threadReplyCount,
      lastReplyAt,
      editedAt: null,
    };
  }

  return {
    roomId,
    senderId: faker.helpers.arrayElement(memberIds),
    type: "text",
    body: textDoc(faker.lorem.sentences({ min: 1, max: 3 })),
    metadata: null,
    parentMessageId,
    replyToMessageId,
    threadReplyCount,
    lastReplyAt,
    editedAt:
      faker.helpers.maybe(() => faker.date.recent({ days: 20 }), {
        probability: 0.1,
      }) ?? null,
  };
}

async function seedRoomMessages(
  db: DatabaseType,
  roomId: string,
  memberIds: Array<string>,
  maxRoots: number
): Promise<Array<ChatMessageDataModel>> {
  const rootCount = faker.number.int({ min: 2, max: Math.max(2, maxRoots) });

  const rootsPlan = Array.from({ length: rootCount }, () => ({
    replyCount: faker.helpers.weightedArrayElement(REPLY_DISTRIBUTION),
  }));

  const rootsData: Array<InsertChatMessage> = rootsPlan.map((plan) =>
    createMessage({
      roomId,
      memberIds,
      parentMessageId: null,
      replyToMessageId: null,
      threadReplyCount: plan.replyCount,
      lastReplyAt: plan.replyCount > 0 ? faker.date.recent({ days: 20 }) : null,
      allowSystem: true,
    })
  );

  const roots = await insertChunkedReturning(rootsData, (chunk) =>
    db.insert(ChatMessageTable).values(chunk).returning()
  );

  const repliesData: Array<InsertChatMessage> = [];

  roots.forEach((root, index) => {
    const plan = rootsPlan[index]!;

    for (let i = 0; i < plan.replyCount; i++) {
      repliesData.push(
        createMessage({
          roomId,
          memberIds,
          parentMessageId: root.id,
          replyToMessageId:
            faker.helpers.maybe(() => root.id, { probability: 0.3 }) ?? null,
          threadReplyCount: 0,
          lastReplyAt: null,
          allowSystem: false,
        })
      );
    }
  });

  const replies =
    repliesData.length > 0
      ? await insertChunkedReturning(repliesData, (chunk) =>
          db.insert(ChatMessageTable).values(chunk).returning()
        )
      : [];

  return [...roots, ...replies];
}

export async function seedChat(
  db: DatabaseType,
  users: Array<UserDataModel>
): Promise<Array<ChatRoomDataModel>> {
  console.log("🌱 Seeding chat rooms...");

  const plans = buildRoomPlans(users);

  const rooms = await insertChunkedReturning(
    plans.map((plan) => plan.room),
    (chunk) => db.insert(ChatRoomTable).values(chunk).returning()
  );

  const membersData: Array<InsertChatRoomMember> = [];

  plans.forEach((plan, index) => {
    const room = rooms[index]!;

    plan.memberIds.forEach((userId) => {
      const isOwner = userId === plan.ownerId;

      membersData.push({
        roomId: room.id,
        userId,
        role: isOwner
          ? "owner"
          : (faker.helpers.maybe(() => "admin" as const, {
              probability: 0.2,
            }) ?? "member"),
        isMuted: faker.datatype.boolean(0.1),
        lastReadMessageId: null,
        lastReadAt: null,
      });
    });
  });

  await insertChunked(membersData, (chunk) =>
    db.insert(ChatRoomMemberTable).values(chunk)
  );

  console.log(`✅ ${rooms.length} Chat rooms seeded`);

  console.log("🌱 Seeding chat messages...");

  const roomMembers = new Map<string, Array<string>>();
  const maxRoots = Math.max(
    2,
    Math.floor(seedConfigs.targets.chatMessages / Math.max(1, rooms.length))
  );

  const allMessages: Array<ChatMessageDataModel> = [];

  for (const [index, plan] of plans.entries()) {
    const room = rooms[index]!;
    roomMembers.set(room.id, plan.memberIds);

    const messages = await seedRoomMessages(
      db,
      room.id,
      plan.memberIds,
      maxRoots
    );
    allMessages.push(...messages);
  }

  console.log(`✅ ${allMessages.length} Chat messages seeded`);

  console.log("🌱 Seeding chat reactions...");

  const reactionTargets = faker.helpers.arrayElements(
    allMessages,
    Math.floor(allMessages.length * 0.3)
  );

  const reactionsData: Array<InsertChatMessageReaction> = [];

  for (const message of reactionTargets) {
    const memberIds = roomMembers.get(message.roomId) ?? [];
    if (memberIds.length === 0) continue;

    const reactionCount = faker.number.int({ min: 1, max: 3 });
    const used = new Set<string>();

    for (let i = 0; i < reactionCount; i++) {
      const userId = faker.helpers.arrayElement(memberIds);
      const emoji = faker.helpers.arrayElement(REACTION_EMOJIS);
      const key = `${message.id}:${userId}:${emoji}`;

      if (used.has(key)) continue;
      used.add(key);

      reactionsData.push({ messageId: message.id, userId, emoji });
    }
  }

  await insertChunked(reactionsData, (chunk) =>
    db.insert(ChatMessageReactionTable).values(chunk)
  );

  console.log(`✅ ${reactionsData.length} Chat reactions seeded`);

  console.log("🌱 Seeding chat attachments...");

  const attachmentTargets = faker.helpers.arrayElements(
    allMessages,
    Math.min(seedConfigs.targets.chatAttachments, allMessages.length)
  );

  const filesData: Array<InsertFile> = attachmentTargets.map((message) => {
    const filename = faker.system.fileName();

    return {
      key: `${faker.string.uuid()}/${filename}`,
      filename,
      originalName: filename,
      mimeType: faker.system.mimeType(),
      size: faker.number.int({ min: 1_000, max: 5_000_000 }),
      url: faker.internet.url(),
      uploadedBy: message.senderId,
      entityType: "chat_message",
      entityId: message.id,
    };
  });

  const files = await insertChunkedReturning(filesData, (chunk) =>
    db.insert(FileTable).values(chunk).returning()
  );

  const attachmentsData: Array<InsertChatMessageAttachment> = files.map(
    (file, index) => ({
      messageId: attachmentTargets[index]!.id,
      fileId: file.id,
      position: 0,
    })
  );

  await insertChunked(attachmentsData, (chunk) =>
    db.insert(ChatMessageAttachmentTable).values(chunk)
  );

  console.log(`✅ ${attachmentsData.length} Chat attachments seeded`);

  return rooms;
}

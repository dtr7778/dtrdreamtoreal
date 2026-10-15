import { createRoute, z } from "@hono/zod-openapi";

import { chatMessageItemSchema } from "@workspace/lib/chat";
import { tiptapDocSchema } from "@workspace/lib/tiptap";
import { apiOutputSchema } from "@workspace/lib/zod-schemas";
import {
  jsonContent,
  OK,
  routeMiddleware,
  SWITCHING_PROTOCOLS,
} from "@workspace/server-core";

import { authMiddleware } from "@/middlewares/auth.middleware";

const tags = ["chat"];

export const chatWebSocketRoute = createRoute({
  method: "get",
  path: "/chat/ws",
  summary: "Open the realtime chat WebSocket",
  tags,
  responses: {
    [SWITCHING_PROTOCOLS]: {
      description: "Switching protocols to WebSocket",
    },
  },
});

export const sendMessageRoute = createRoute({
  method: "post",
  path: "/chat/messages/send",
  summary: "Send a message, optionally in a thread with attachments",
  tags,
  middleware: routeMiddleware(authMiddleware),
  request: {
    body: jsonContent(
      z
        .object({
          roomId: z.uuid(),
          body: tiptapDocSchema.optional(),
          fileIds: z.array(z.uuid()).max(10).optional(),
          parentMessageId: z.uuid().nullish(),
          replyToMessageId: z.uuid().nullish(),
        })
        .refine(
          (value) =>
            (value.body?.content?.length ?? 0) > 0 ||
            (value.fileIds?.length ?? 0) > 0,
          {
            message: "Message must have text or at least one attachment.",
            path: ["body"],
          }
        ),
      "Send message"
    ),
  },
  responses: {
    [OK]: jsonContent(apiOutputSchema(chatMessageItemSchema), "Sent message"),
  },
});

export const toggleReactionRoute = createRoute({
  method: "post",
  path: "/chat/messages/react",
  summary: "Toggle an emoji reaction on a message",
  tags,
  middleware: routeMiddleware(authMiddleware),
  request: {
    body: jsonContent(
      z.object({
        messageId: z.uuid(),
        emoji: z.string().min(1).max(16),
      }),
      "Toggle reaction"
    ),
  },
  responses: {
    [OK]: jsonContent(
      apiOutputSchema(chatMessageItemSchema),
      "Updated message"
    ),
  },
});

export const markRoomReadRoute = createRoute({
  method: "post",
  path: "/chat/rooms/read",
  summary: "Mark a conversation as read up to a message",
  tags,
  middleware: routeMiddleware(authMiddleware),
  request: {
    body: jsonContent(
      z.object({
        roomId: z.uuid(),
        messageId: z.uuid(),
      }),
      "Mark room read"
    ),
  },
  responses: {
    [OK]: jsonContent(apiOutputSchema(z.null()), "Marked read"),
  },
});

export type ChatWebSocketRouteType = typeof chatWebSocketRoute;
export type SendMessageRouteType = typeof sendMessageRoute;
export type ToggleReactionRouteType = typeof toggleReactionRoute;
export type MarkRoomReadRouteType = typeof markRoomReadRoute;

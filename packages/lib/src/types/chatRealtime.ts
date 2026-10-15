import type { ChatMessageItemType } from "../chat";

export type ChatRealtimeClientEvent =
  { type: "typing"; roomId: string; isTyping: boolean } | { type: "ping" };

export type ChatRealtimeServerEvent =
  | { type: "message"; roomId: string; data: ChatMessageItemType }
  | { type: "reaction"; roomId: string; data: ChatMessageItemType }
  | {
      type: "read";
      roomId: string;
      data: { userId: string; messageId: string; lastReadAt: string };
    }
  | {
      type: "typing";
      roomId: string;
      data: { userId: string; isTyping: boolean };
    }
  | {
      type: "presence";
      data: { userId: string; online: boolean };
    }
  | {
      type: "presence_sync";
      data: { userIds: Array<string> };
    }
  | { type: "pong" };

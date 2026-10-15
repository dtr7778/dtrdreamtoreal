import type { RefObject } from "react";

import type { FileUploadRef, ProgressType } from "#/components/FileUpload";
import { useFileUploadToAPI } from "#/features/upload/hook/useFileUploadToAPI";
import { apiClient } from "#/lib/hono-api";
import { orpcTQClient } from "#/server/orpc";
import { useAuthStore } from "#/stores/zustand/auth/AuthStoreContext";
import { formatOrpcError } from "#/utils/formatOrpcError";
import type {
  InfiniteData,
  QueryClient,
  QueryKey,
} from "@tanstack/react-query";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { InferRequestType, InferResponseType } from "hono/client";
import toast from "react-hot-toast";

import type { ChatMessageTypeEnumType } from "@workspace/drizzle/zod-db-enums";
import type { ChatMessageItemType } from "@workspace/lib/chat";
import type { IApiHookInput } from "@workspace/lib/types";

import type { MessageCursorType } from "../chat.cursor";
import type { CreateGroupType, UpdateGroupType } from "../chat.schema";
import type {
  CreateGroupContractType,
  UpdateGroupContractType,
} from "./chat.contract";

const PAGE_SIZE = 30;

type MessagePageType = {
  message: string;
  success: boolean;
  data: {
    items: Array<ChatMessageItemType>;
    olderCursor: string | null;
    newerCursor: string | null;
  };
};

type MessageInfiniteData = InfiniteData<
  MessagePageType,
  MessageCursorType | null
>;

type JsonMessageItemType = Omit<
  ChatMessageItemType,
  "createdAt" | "updatedAt" | "editedAt" | "lastReplyAt"
> & {
  createdAt: string;
  updatedAt: string;
  editedAt: string | null;
  lastReplyAt: string | null;
};

/** API responses are JSON, so date fields arrive as strings and must be revived. */
function reviveMessageDates(message: JsonMessageItemType): ChatMessageItemType {
  return {
    ...message,
    createdAt: new Date(message.createdAt),
    updatedAt: new Date(message.updatedAt),
    editedAt: message.editedAt ? new Date(message.editedAt) : null,
    lastReplyAt: message.lastReplyAt ? new Date(message.lastReplyAt) : null,
  };
}

export function chatMessagesInput({
  roomId,
  parentMessageId,
}: {
  roomId: string;
  parentMessageId?: string;
}) {
  return (pageParam: MessageCursorType | null) => ({
    roomId,
    parentMessageId: parentMessageId ?? null,
    before: pageParam?.before,
    after: pageParam?.after,
    inclusive: pageParam?.inclusive,
    fromOldest: pageParam?.fromOldest,
    limit: PAGE_SIZE,
  });
}

export function chatMessagesPageOptions({
  roomId,
  parentMessageId,
  anchor = null,
}: {
  roomId: string;
  parentMessageId?: string;
  anchor?: MessageCursorType | null;
}) {
  return orpcTQClient.chat.listMessages.infiniteOptions({
    input: chatMessagesInput({ roomId, parentMessageId }),
    initialPageParam: anchor,
    getPreviousPageParam: (firstPage) =>
      firstPage.data.olderCursor
        ? { before: firstPage.data.olderCursor }
        : undefined,
    getNextPageParam: (lastPage) =>
      lastPage.data.newerCursor
        ? { after: lastPage.data.newerCursor }
        : undefined,
  });
}

export function useChatMessagesQuery({
  roomId,
  parentMessageId,
  anchor,
}: {
  roomId: string;
  parentMessageId?: string;
  anchor?: MessageCursorType | null;
}) {
  return useInfiniteQuery({
    ...chatMessagesPageOptions({ roomId, parentMessageId, anchor }),
    select: (result) => ({
      ...result,
      pages: result.pages.map((page) => page.data),
    }),
  });
}

function removeMessageFromPages(
  old: MessageInfiniteData,
  messageId: string
): MessageInfiniteData {
  let changed = false;

  const pages = old.pages.map((page) => {
    const items = page.data.items.filter((item) => item.id !== messageId);
    if (items.length === page.data.items.length) return page;

    changed = true;
    return { ...page, data: { ...page.data, items } };
  });

  return changed ? { ...old, pages } : old;
}

/**
 * Pages are stored in chronological order (oldest first). New messages only
 * belong at the end of the list when the last page reaches the latest message;
 * otherwise the user is viewing history and the newer pages load on scroll.
 */
function appendToLatestPage(
  old: MessageInfiniteData,
  message: ChatMessageItemType
): MessageInfiniteData {
  const lastPage = old.pages.at(-1);
  if (!lastPage || lastPage.data.newerCursor !== null) return old;

  return {
    ...old,
    pages: [
      ...old.pages.slice(0, -1),
      {
        ...lastPage,
        data: {
          ...lastPage.data,
          items: [...lastPage.data.items, message],
        },
      },
    ],
  };
}

function isRoomMessagesQuery(queryKey: QueryKey, roomId: string): boolean {
  const state = queryKey[1] as
    { type?: string; input?: { roomId?: string } } | undefined;

  return state?.type === "infinite" && state.input?.roomId === roomId;
}

/**
 * Applies `updater` to every cached message list of a room, so the main timeline
 * and any open thread stay in sync.
 */
function updateRoomMessageLists(
  queryClient: QueryClient,
  roomId: string,
  updater: (queryKey: QueryKey, old: MessageInfiniteData) => MessageInfiniteData
) {
  const queries = queryClient.getQueryCache().findAll({
    predicate: (query) => isRoomMessagesQuery(query.queryKey, roomId),
  });

  for (const query of queries) {
    queryClient.setQueryData<MessageInfiniteData>(query.queryKey, (old) =>
      old ? updater(query.queryKey, old) : old
    );
  }
}

export function updateMessageInCaches(
  queryClient: QueryClient,
  roomId: string,
  messageId: string,
  updater: (message: ChatMessageItemType) => ChatMessageItemType
) {
  const queries = queryClient.getQueryCache().findAll({
    predicate: (query) => isRoomMessagesQuery(query.queryKey, roomId),
  });

  for (const query of queries) {
    queryClient.setQueryData<MessageInfiniteData>(query.queryKey, (old) => {
      if (!old) return;

      let changed = false;
      const pages = old.pages.map((page) => ({
        ...page,
        data: {
          ...page.data,
          items: page.data.items.map((item) => {
            if (item.id !== messageId) return item;
            changed = true;
            return updater(item);
          }),
        },
      }));

      return changed ? { ...old, pages } : old;
    });
  }
}

function messageCacheMatches(
  queryKey: QueryKey,
  message: ChatMessageItemType
): boolean {
  const state = queryKey[1] as
    | { input?: { roomId?: string; parentMessageId?: string | null } }
    | undefined;
  const input = state?.input;

  if (!input || input.roomId !== message.roomId) return false;

  return (input.parentMessageId ?? null) === (message.parentMessageId ?? null);
}

function messageExistsInCaches(
  queryClient: QueryClient,
  roomId: string,
  messageId: string
): boolean {
  const queries = queryClient.getQueryCache().findAll({
    predicate: (query) => isRoomMessagesQuery(query.queryKey, roomId),
  });

  return queries.some((query) => {
    const data = query.state.data as MessageInfiniteData | undefined;
    return data?.pages.some((page) =>
      page.data.items.some((item) => item.id === messageId)
    );
  });
}

/**
 * Insert a realtime message into the matching infinite cache (main timeline or
 * the thread it belongs to), deduping by id. A thread reply also bumps the
 * reply counter of its root message in the main timeline cache.
 */
export function upsertMessageInCaches(
  queryClient: QueryClient,
  roomId: string,
  message: ChatMessageItemType
) {
  if (messageExistsInCaches(queryClient, roomId, message.id)) return;

  const queries = queryClient.getQueryCache().findAll({
    predicate: (query) => isRoomMessagesQuery(query.queryKey, roomId),
  });

  for (const query of queries) {
    if (!messageCacheMatches(query.queryKey, message)) continue;

    queryClient.setQueryData<MessageInfiniteData>(query.queryKey, (old) =>
      old && old.pages.length > 0 ? appendToLatestPage(old, message) : old
    );
  }

  if (message.parentMessageId) {
    updateMessageInCaches(
      queryClient,
      message.roomId,
      message.parentMessageId,
      (parent) => ({
        ...parent,
        threadReplyCount: parent.threadReplyCount + 1,
        lastReplyAt: message.createdAt,
      })
    );
  }
}

export function useSendMessage({
  roomId,
  parentMessageId = undefined,
  onSuccess,
  onError,
}: IApiHookInput & {
  roomId: string;
  parentMessageId?: string | undefined;
}) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation<
    InferResponseType<typeof apiClient.chat.messages.send.$post>,
    Error,
    InferRequestType<typeof apiClient.chat.messages.send.$post>["json"],
    { tempId: string }
  >({
    mutationFn: async (input) => {
      const res = await apiClient.chat.messages.send.$post({ json: input });
      return res.json();
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        predicate: (query) => isRoomMessagesQuery(query.queryKey, roomId),
      });
      const tempId = `optimistic-${crypto.randomUUID()}`;
      const now = new Date();
      const type: ChatMessageTypeEnumType =
        (input.body?.content?.length ?? 0) > 0 ? "text" : "attachment";

      const optimisticMessage: ChatMessageItemType = {
        id: tempId,
        roomId,
        sender: {
          id: user.id,
          name: user.name,
          image: user.image ?? null,
        },
        type,
        body: input.body ?? null,
        createdAt: now,
        updatedAt: now,
        editedAt: null,
        parentMessageId: parentMessageId ?? null,
        replyToMessageId: input.replyToMessageId ?? null,
        replyTo: null,
        threadReplyCount: 0,
        lastReplyAt: null,
        reactions: [],
        attachments: [],
      };

      updateRoomMessageLists(queryClient, roomId, (queryKey, old) =>
        messageCacheMatches(queryKey, optimisticMessage)
          ? appendToLatestPage(old, optimisticMessage)
          : old
      );

      return { tempId };
    },
    onSuccess: ({ message, data }, _input, context) => {
      updateRoomMessageLists(queryClient, roomId, (_queryKey, old) => {
        let changed = false;

        const pages = old.pages.map((page) => {
          const seen = new Set<string>();
          let pageChanged = false;
          const items: Array<ChatMessageItemType> = [];

          for (const item of page.data.items) {
            const resolved =
              item.id === context.tempId ? reviveMessageDates(data) : item;
            if (resolved !== item) pageChanged = true;
            if (seen.has(resolved.id)) {
              pageChanged = true;
              continue;
            }
            seen.add(resolved.id);
            items.push(resolved);
          }

          if (!pageChanged) return page;
          changed = true;
          return { ...page, data: { ...page.data, items } };
        });

        return changed ? { ...old, pages } : old;
      });

      onSuccess?.(message);
    },
    onError: (error, _input, context) => {
      if (context) {
        updateRoomMessageLists(queryClient, roomId, (_queryKey, old) =>
          removeMessageFromPages(old, context.tempId)
        );
      }

      toast.error(error.message);
      onError?.(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: orpcTQClient.chat.listMessages.queryKey({
          input: { roomId },
        }),
      });
      queryClient.invalidateQueries({
        queryKey: orpcTQClient.chat.roomDetails.queryKey({
          input: { roomId },
        }),
        exact: true,
      });
    },
  });
}

export function useCreateRoom() {
  const toastId = "create_room_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.chat.createRoom.mutationOptions({
      onMutate: () => {},
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.chat.listConversation.queryKey({ input: {} }),
          exact: false,
        });
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);

        toast.error(message, { id: toastId });
      },
    })
  );
}

export function useCreateGroup<TFieldNames>({
  uploadRef,
  onProgress,
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames> & {
  uploadRef?: RefObject<FileUploadRef | null>;
  onProgress?: (progress: ProgressType) => void;
}) {
  const toastId = "create_group_toast_message";
  const queryClient = useQueryClient();

  const { mutateAsync: uploadImage } = useFileUploadToAPI({
    onProgress,
    onSuccess: () => {
      uploadRef?.current?.clearFiles();
      uploadRef?.current?.clearErrors();
    },
  });

  const { mutateAsync: createGroup } = useMutation(
    orpcTQClient.chat.createGroup.mutationOptions()
  );

  return useMutation<
    CreateGroupContractType["output"],
    Error,
    CreateGroupType & {
      imageFile?: File | null;
    }
  >({
    mutationKey: ["create-group"],
    mutationFn: async ({ name, memberIds, imageFile }) => {
      let imageFileId: string | undefined = undefined;

      if (imageFile) {
        const { data } = await uploadImage({
          file: imageFile,
          entityType: "chat_room_image",
          scope: "chat_room_image",
        });
        imageFileId = data.id;
      }

      return createGroup({ name, memberIds, imageFileId });
    },
    onMutate: () => {
      toast.loading("Loading...", { id: toastId });
      onRequestStart?.();
    },
    onSuccess: async ({ message }) => {
      toast.success(message, { id: toastId });
      await queryClient.invalidateQueries({
        queryKey: orpcTQClient.chat.listConversation.queryKey({ input: {} }),
        exact: false,
      });
      onSuccess?.(message);
    },
    onError: (error) => {
      const { message, type, fieldErrors } =
        formatOrpcError<TFieldNames>(error);

      if (type === "validation" && fieldErrors) {
        onValidationErrors?.(fieldErrors);
      }

      toast.error(message, { id: toastId });
      onError?.(message);
    },
    onSettled: () => {
      onRequestEnd?.();
    },
  });
}

export function useUpdateGroup<TFieldNames>({
  uploadRef,
  onProgress,
  onRequestStart,
  onRequestEnd,
  onSuccess,
  onError,
  onValidationErrors,
}: IApiHookInput<TFieldNames> & {
  uploadRef?: RefObject<FileUploadRef | null>;
  onProgress?: (progress: ProgressType) => void;
}) {
  const toastId = "update_group_toast_message";
  const queryClient = useQueryClient();

  const { mutateAsync: uploadImage } = useFileUploadToAPI({
    onProgress,
    onSuccess: () => {
      uploadRef?.current?.clearFiles();
      uploadRef?.current?.clearErrors();
    },
  });

  const { mutateAsync: updateGroup } = useMutation(
    orpcTQClient.chat.updateGroup.mutationOptions()
  );

  return useMutation<
    UpdateGroupContractType["output"],
    Error,
    UpdateGroupType & {
      imageFile?: File | null;
    }
  >({
    mutationKey: ["update-group"],
    mutationFn: async ({ roomId, name, imageFile, memberIds }) => {
      let imageFileId: string | undefined = undefined;

      if (imageFile) {
        const { data } = await uploadImage({
          file: imageFile,
          entityType: "chat_room_image",
          entityId: roomId,
          scope: "chat_room_image",
        });
        imageFileId = data.id;
      }

      return updateGroup({
        roomId,
        name,
        imageFileId,
        memberIds,
      });
    },
    onMutate: () => {
      onRequestStart?.();
      toast.loading("Loading...", { id: toastId });
    },
    onSuccess: async ({ message }, { roomId }) => {
      toast.success(message, { id: toastId });
      await queryClient.invalidateQueries({
        queryKey: orpcTQClient.chat.listConversation.queryKey({ input: {} }),
        exact: false,
      });
      await queryClient.invalidateQueries({
        queryKey: orpcTQClient.chat.roomDetails.queryKey({
          input: { roomId },
        }),
        exact: true,
      });
      onSuccess?.(message);
    },
    onError: (error) => {
      const { message, type, fieldErrors } =
        formatOrpcError<TFieldNames>(error);

      if (type === "validation" && fieldErrors) {
        onValidationErrors?.(fieldErrors);
      }

      toast.error(message, { id: toastId });
      onError?.(message);
    },
    onSettled: () => {
      onRequestEnd?.();
    },
  });
}

export function useDeleteGroup({
  onSuccess,
}: {
  onSuccess?: (roomId: string) => void;
} = {}) {
  const toastId = "delete_group_toast_message";
  const queryClient = useQueryClient();

  return useMutation(
    orpcTQClient.chat.deleteGroup.mutationOptions({
      onMutate: () => {
        toast.loading("Deleting...", { id: toastId });
      },
      onSuccess: async ({ message }, { roomId }) => {
        toast.success(message, { id: toastId });
        queryClient.removeQueries({
          queryKey: orpcTQClient.chat.roomDetails.queryKey({
            input: { roomId },
          }),
          exact: true,
        });
        queryClient.removeQueries({
          queryKey: orpcTQClient.chat.listMessages.queryKey({
            input: { roomId },
          }),
        });
        await queryClient.invalidateQueries({
          queryKey: orpcTQClient.chat.listConversation.queryKey({ input: {} }),
          exact: false,
        });
        onSuccess?.(roomId);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);
        toast.error(message, { id: toastId });
      },
    })
  );
}

export function useSetRoomMute(roomId: string, userId: string) {
  const queryClient = useQueryClient();
  const listConversationKey = orpcTQClient.chat.listConversation.queryKey({
    input: {},
  });
  const roomDetailsKey = orpcTQClient.chat.roomDetails.queryKey({
    input: { roomId },
  });

  return useMutation(
    orpcTQClient.chat.setRoomMuted.mutationOptions({
      onMutate: ({ isMuted }) => {
        queryClient.setQueryData(listConversationKey, (old) => {
          if (!old) return;

          return {
            ...old,
            data: old.data.map((conversation) =>
              conversation.roomId === roomId
                ? { ...conversation, isMuted }
                : conversation
            ),
          };
        });
        queryClient.setQueryData(roomDetailsKey, (old) => {
          if (!old) return;

          return {
            ...old,
            data: {
              ...old.data,
              myMembership: { ...old.data.myMembership, isMuted },
              members: old.data.members.map((memeber) =>
                memeber.userId === userId
                  ? {
                      ...memeber,
                      isMuted,
                    }
                  : memeber
              ),
            },
          };
        });
      },
      onSuccess: ({ message }) => {
        toast.success(message);
      },
      onError: (error) => {
        const { message } = formatOrpcError(error);
        toast.error(message);
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({
          queryKey: listConversationKey,
          exact: false,
        });
        await queryClient.invalidateQueries({
          queryKey: roomDetailsKey,
          exact: true,
        });
      },
    })
  );
}

export function useToggleReaction({ roomId }: { roomId: string }) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation<
    InferResponseType<typeof apiClient.chat.messages.react.$post>,
    Error,
    InferRequestType<typeof apiClient.chat.messages.react.$post>["json"]
  >({
    mutationFn: async (input) => {
      const res = await apiClient.chat.messages.react.$post({ json: input });
      return res.json();
    },
    onMutate: async ({ messageId, emoji }) => {
      updateMessageInCaches(queryClient, roomId, messageId, (message) => {
        const existing = message.reactions.find(
          (reaction) => reaction.emoji === emoji
        );

        if (existing && existing.reactedByMe) {
          const userIds = existing.userIds.filter((id) => id !== user.id);
          const nextReactions = userIds.length
            ? message.reactions.map((reaction) =>
                reaction.emoji === emoji
                  ? {
                      ...reaction,
                      count: userIds.length,
                      userIds,
                      reactedByMe: false,
                    }
                  : reaction
              )
            : message.reactions.filter((reaction) => reaction.emoji !== emoji);

          return { ...message, reactions: nextReactions };
        }

        if (existing) {
          return {
            ...message,
            reactions: message.reactions.map((reaction) =>
              reaction.emoji === emoji
                ? {
                    ...reaction,
                    count: reaction.count + 1,
                    userIds: [...reaction.userIds, user.id],
                    reactedByMe: true,
                  }
                : reaction
            ),
          };
        }

        return {
          ...message,
          reactions: [
            ...message.reactions,
            {
              emoji,
              count: 1,
              reactedByMe: true,
              userIds: [user.id],
            },
          ],
        };
      });
    },
    onSuccess: ({ data }) => {
      const reacted = reviveMessageDates(data);
      updateMessageInCaches(queryClient, roomId, reacted.id, () => reacted);
    },
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: orpcTQClient.chat.listMessages.queryKey({
          input: { roomId },
        }),
        exact: true,
      });
    },
  });
}

export function useMarkRoomRead() {
  const queryClient = useQueryClient();
  const listConversationKey = orpcTQClient.chat.listConversation.queryKey({
    input: {},
  });

  return useMutation<
    InferResponseType<typeof apiClient.chat.rooms.read.$post>,
    Error,
    InferRequestType<typeof apiClient.chat.rooms.read.$post>["json"]
  >({
    mutationFn: async (input) => {
      const res = await apiClient.chat.rooms.read.$post({ json: input });
      return res.json();
    },
    onMutate: ({ roomId }) => {
      queryClient.setQueryData(listConversationKey, (old) => {
        if (!old) return;

        return {
          ...old,
          data: old.data.map((conversation) =>
            conversation.roomId !== roomId || conversation.unreadCount === 0
              ? conversation
              : { ...conversation, unreadCount: 0 }
          ),
        };
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: listConversationKey,
        exact: false,
      });
    },
  });
}

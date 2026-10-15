import { useMemo, useRef } from "react";

import { useEditor, useEditorState } from "@tiptap/react";

import type { ChatMemberType } from "@workspace/lib/chat";
import { useAsRef } from "@workspace/ui/hooks/use-as-ref";

import { buildMentionItems } from "../../chat.mentions";
import { createComposerExtensions } from "./extensions";

export function useMessageEditor({
  members,
  currentUserId,
  placeholder,
  sendOnEnter,
  onSubmit,
  onFiles,
  onActivity,
}: {
  members: Array<ChatMemberType>;
  currentUserId?: string | null;
  placeholder: string;
  sendOnEnter: boolean;
  onSubmit: () => void;
  onFiles: (files: Array<File>) => void;
  onActivity?: () => void;
}) {
  const membersRef = useAsRef(members);
  const currentUserIdRef = useAsRef(currentUserId);

  const mentionActiveRef = useRef(false);

  const onSubmitRef = useAsRef(onSubmit);
  const onFilesRef = useAsRef(onFiles);
  const onActivityRef = useAsRef(onActivity);

  const extensions = useMemo(
    () =>
      createComposerExtensions({
        placeholder,
        getMentionItems: () =>
          buildMentionItems(membersRef.current, currentUserIdRef.current),
        onMentionActiveChange: (active) => {
          mentionActiveRef.current = active;
        },
      }),
    [placeholder]
  );

  const editor = useEditor(
    {
      extensions,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class:
            "chat-editor max-h-40 min-h-8 overflow-y-auto px-1 py-1.5 text-sm outline-none",
        },
        handleKeyDown: (_view, event) => {
          if (event.key !== "Enter" || event.isComposing) return false;
          if (mentionActiveRef.current) return false;

          const isSendShortcut =
            event.metaKey || event.ctrlKey || (!event.shiftKey && sendOnEnter);

          if (isSendShortcut) {
            event.preventDefault();
            onSubmitRef.current();
            return true;
          }

          return false;
        },
        handlePaste: (_view, event) => {
          const files = Array.from(event.clipboardData?.files ?? []);
          if (files.length === 0) return false;
          event.preventDefault();
          onFilesRef.current(files);
          return true;
        },
        handleDrop: (_view, event) => {
          const files = Array.from(event.dataTransfer?.files ?? []);
          if (files.length === 0) return false;
          event.preventDefault();
          onFilesRef.current(files);
          return true;
        },
      },
      onUpdate: () => {
        onActivityRef.current?.();
      },
    },
    [extensions, sendOnEnter]
  );

  const characterCount =
    useEditorState({
      editor,
      selector: ({ editor: current }) => current?.getText().length ?? 0,
    }) ?? 0;

  return { editor, characterCount };
}

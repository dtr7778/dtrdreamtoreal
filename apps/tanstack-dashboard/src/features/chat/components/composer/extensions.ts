import Mention from "@tiptap/extension-mention";
import Placeholder from "@tiptap/extension-placeholder";
import type { Extensions } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import type { MentionItem } from "../../chat.mentions";
import { createMentionSuggestion } from "./mention.suggestion";

export function createComposerExtensions({
  placeholder,
  getMentionItems,
  onMentionActiveChange,
}: {
  placeholder: string;
  getMentionItems: () => Array<MentionItem>;
  onMentionActiveChange: (active: boolean) => void;
}): Extensions {
  return [
    StarterKit.configure({
      heading: false,
      horizontalRule: false,
      trailingNode: false,
      link: {
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      },
    }),
    Placeholder.configure({ placeholder }),
    Mention.configure({
      HTMLAttributes: { class: "chat-mention" },
      suggestion: createMentionSuggestion({
        getItems: getMentionItems,
        onActiveChange: onMentionActiveChange,
      }),
    }),
  ];
}

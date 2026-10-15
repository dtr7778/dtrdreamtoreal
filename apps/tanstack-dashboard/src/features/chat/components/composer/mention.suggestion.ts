import { computePosition, flip, shift } from "@floating-ui/dom";
import type { MentionNodeAttrs } from "@tiptap/extension-mention";
import { ReactRenderer } from "@tiptap/react";
import type {
  SuggestionKeyDownProps,
  SuggestionOptions,
} from "@tiptap/suggestion";

import type { MentionItem } from "../../chat.mentions";
import type { MentionListProps, MentionListRef } from "./MentionList";
import { MentionList } from "./MentionList";

type MentionSuggestion = Omit<
  SuggestionOptions<MentionItem, MentionNodeAttrs>,
  "editor"
>;

export function createMentionSuggestion({
  getItems,
  onActiveChange,
}: {
  getItems: () => Array<MentionItem>;
  onActiveChange: (active: boolean) => void;
}): MentionSuggestion {
  return {
    char: "@",
    allowSpaces: false,
    items: ({ query }) => {
      const normalized = query.trim().toLowerCase();
      return getItems()
        .filter((item) => item.label.toLowerCase().includes(normalized))
        .slice(0, 8);
    },
    render: () => {
      let component: ReactRenderer<MentionListRef, MentionListProps> | null =
        null;
      let popup: HTMLDivElement | null = null;

      function updatePosition(clientRect?: (() => DOMRect | null) | null) {
        if (!popup || !clientRect) return;

        const virtual = {
          getBoundingClientRect: () => clientRect() ?? new DOMRect(),
        };

        void computePosition(virtual, popup, {
          placement: "bottom-start",
          middleware: [flip(), shift({ padding: 8 })],
        }).then(({ x, y }) => {
          if (!popup) return;
          Object.assign(popup.style, {
            left: `${x}px`,
            top: `${y}px`,
          });
        });
      }

      function handleKeyDown(props: SuggestionKeyDownProps) {
        if (props.event.key === "Escape") {
          onActiveChange(false);
          return true;
        }
        return component?.ref?.onKeyDown(props) ?? false;
      }

      return {
        onStart: (props) => {
          onActiveChange(true);
          component = new ReactRenderer<MentionListRef, MentionListProps>(
            MentionList,
            {
              props: { items: props.items, command: props.command },
              editor: props.editor,
            }
          );
          popup = document.createElement("div");

          Object.assign(popup.style, {
            position: "fixed",
            zIndex: "50",
          });

          popup.appendChild(component.element);
          document.body.appendChild(popup);
          updatePosition(props.clientRect);
        },
        onUpdate: (props) => {
          component?.updateProps({
            items: props.items,
            command: props.command,
          });
          updatePosition(props.clientRect);
        },
        onKeyDown: handleKeyDown,
        onExit: () => {
          onActiveChange(false);
          popup?.remove();
          component?.destroy();
          popup = null;
          component = null;
        },
      };
    },
  };
}

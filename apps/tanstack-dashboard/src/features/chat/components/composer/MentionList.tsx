import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import { resolveUserImage } from "#/utils/resolveUserImage";
import { Hash } from "lucide-react";

import { strInitials } from "@workspace/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { cn } from "@workspace/ui/lib/utils";

import { EVERYONE_MENTION_ID } from "../../chat.mentions";
import type { MentionItem } from "../../chat.mentions";

export type MentionListRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

export type MentionListProps = {
  items: Array<MentionItem>;
  command: (item: MentionItem) => void;
};

export const MentionList = forwardRef<MentionListRef, MentionListProps>(
  function MentionListInner({ items, command }, ref) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    function selectItem(index: number) {
      const item = items[index];
      if (item) command(item);
    }

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (items.length === 0) return false;

        if (event.key === "ArrowUp") {
          setSelectedIndex(
            (index) => (index + items.length - 1) % items.length
          );
          return true;
        }

        if (event.key === "ArrowDown") {
          setSelectedIndex((index) => (index + 1) % items.length);
          return true;
        }

        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }

        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="w-56 rounded-lg border bg-popover p-2 text-xs text-muted-foreground shadow-md">
          No people found
        </div>
      );
    }

    return (
      <div
        role="listbox"
        aria-label="Mention suggestions"
        className="w-56 overflow-hidden rounded-md border bg-popover p-1 shadow-md"
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={index === selectedIndex}
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => selectItem(index)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm transition-colors",
              index === selectedIndex
                ? "bg-accent text-accent-foreground"
                : "hover:bg-muted"
            )}
          >
            {item.id === EVERYONE_MENTION_ID ? (
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Hash className="size-3.5" aria-hidden="true" />
              </span>
            ) : (
              <Avatar className="size-6 shrink-0">
                <AvatarImage
                  src={resolveUserImage(item.image)}
                  alt={item.label}
                />
                <AvatarFallback>{strInitials(item.label)}</AvatarFallback>
              </Avatar>
            )}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
          </button>
        ))}
      </div>
    );
  }
);

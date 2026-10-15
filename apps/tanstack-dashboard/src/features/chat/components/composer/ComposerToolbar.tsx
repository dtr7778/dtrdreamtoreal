import { useState } from "react";
import type { ReactNode } from "react";

import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import {
  Bold,
  Code,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  SquareCode,
  Strikethrough,
  Unlink,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { cn } from "@workspace/ui/lib/utils";

function ToolbarButton({
  active,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn("rounded-md", active && "bg-muted text-foreground")}
    >
      {children}
    </Button>
  );
}

function LinkControl({
  editor,
  isActive,
}: {
  editor: Editor;
  isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [href, setHref] = useState("");

  function applyLink() {
    const url = href.trim();
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    setOpen(false);
  }

  function removeLink() {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setOpen(false);
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setHref(editor.getAttributes("link").href ?? "");
      }}
    >
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Add link"
            aria-pressed={isActive}
            className={cn("rounded-md", isActive && "bg-muted text-foreground")}
          />
        }
      >
        <Link2 />
      </PopoverTrigger>
      <PopoverContent align="start" side="top" className="w-64 gap-1.5 p-2">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            applyLink();
          }}
          className="flex items-center gap-1.5"
        >
          <Input
            type="url"
            value={href}
            onChange={(event) => setHref(event.target.value)}
            placeholder="https://example.com"
            className="h-7"
            autoFocus
          />
          <Button type="submit" disabled={!href.trim()}>
            Add
          </Button>
        </form>
        {isActive && (
          <Button
            type="button"
            variant="secondary"
            onClick={removeLink}
            className="w-full justify-start"
          >
            <Unlink />
            Remove link
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}

function ComposerToolbarInner({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current.isActive("bold"),
      italic: current.isActive("italic"),
      strike: current.isActive("strike"),
      code: current.isActive("code"),
      codeBlock: current.isActive("codeBlock"),
      blockquote: current.isActive("blockquote"),
      bulletList: current.isActive("bulletList"),
      orderedList: current.isActive("orderedList"),
      link: current.isActive("link"),
    }),
  });

  return (
    <div className="flex flex-wrap items-center gap-0.5">
      <ToolbarButton
        label="Bold"
        active={state.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={state.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic />
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        active={state.strike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough />
      </ToolbarButton>
      <ToolbarButton
        label="Inline code"
        active={state.code}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code />
      </ToolbarButton>
      <ToolbarButton
        label="Code block"
        active={state.codeBlock}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <SquareCode />
      </ToolbarButton>
      <ToolbarButton
        label="Blockquote"
        active={state.blockquote}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote />
      </ToolbarButton>
      <ToolbarButton
        label="Bulleted list"
        active={state.bulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={state.orderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered />
      </ToolbarButton>
      <LinkControl isActive={state.link} editor={editor} />
    </div>
  );
}

export function ComposerToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return <ComposerToolbarInner editor={editor} />;
}

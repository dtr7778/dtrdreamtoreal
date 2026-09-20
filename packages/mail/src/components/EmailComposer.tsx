"use client";

import { forwardRef, useCallback, useRef, useState } from "react";

import { EmailEditor, type EmailEditorRef } from "@react-email/editor";
import { extendTheme } from "@react-email/editor/plugins";
import "@react-email/editor/themes/default.css";
import { type Content } from "@tiptap/react";
import { ImagePlus, Link2, Upload } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { useComposedRefs } from "@workspace/ui/hooks/use-composed-refs";

const customTheme = extendTheme("basic", {
  body: {
    backgroundColor: "var(--background)",
  },
  container: {
    borderColor: "var(--border)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderRadius: "calc(var(--radius) * 0.6)",
    backgroundColor: "var(--muted)",
    color: "var(--foreground)", // fixed: was --forground
    paddingInline: "10px",
    width: "auto",
  },
  button: {
    backgroundColor: "var(--primary)",
    color: "var(--primary-foreground)",
  },
});

interface EmailComposerProps {
  defaultContent?: Content;
  /**
   * Upload a picked/pasted/dropped image file and resolve with its hosted URL.
   * Falls back to base64 embedding when omitted (dev only).
   */
  onUploadImage?: (file: File) => Promise<{ url: string }>;
}

export type EmailComposerRef = EmailEditorRef;

const EmailComposer = forwardRef<EmailComposerRef, EmailComposerProps>(
  ({ defaultContent, onUploadImage }, ref) => {
    "use no memo";
    const editorRef = useRef<EmailComposerRef | null>(null);
    const setRefs = useComposedRefs(ref, editorRef);

    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState("");
    const [imageAlt, setImageAlt] = useState("");

    const uploadImage = useCallback(
      async (file: File) => {
        if (onUploadImage) return onUploadImage(file);

        // Dev fallback so it works with no backend. Don't ship this:
        // data URIs massively bloat email HTML and many clients strip them.
        const url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Could not read file"));
          reader.readAsDataURL(file);
        });
        return { url };
      },
      [onUploadImage]
    );

    const handleDialogChange = useCallback((open: boolean) => {
      setImageDialogOpen(open);
      if (!open) {
        setImageSrc("");
        setImageAlt("");
      }
    }, []);

    const handleInsertImage = useCallback(() => {
      const editor = editorRef.current?.editor;
      const src = imageSrc.trim();
      if (!editor || !src) return;

      editor
        .chain()
        .focus()
        .setImage({ src, alt: imageAlt.trim(), alignment: "center" })
        .run();

      handleDialogChange(false);
    }, [imageSrc, imageAlt, handleDialogChange]);

    return (
      <div className="flex flex-col overflow-hidden rounded-sm border bg-background shadow-sm">
        <div className="flex items-center gap-2 border-b p-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button type="button" variant="outline" size="icon" />}
            >
              <ImagePlus className="size-4" aria-hidden />
              <span className="sr-only">image upload</span>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="min-w-36">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() =>
                    editorRef.current?.editor?.commands.uploadImage()
                  }
                >
                  <Upload className="size-4" aria-hidden />
                  <span>Upload image</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDialogChange(true)}>
                  <Link2 className="size-4" aria-hidden />
                  <span>Image from URL</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <EmailEditor
          ref={setRefs}
          content={defaultContent}
          theme={customTheme}
          onUploadImage={uploadImage}
          bubbleMenu={{ hideWhenActiveNodes: ["button", "image"] }}
        />

        <Dialog open={imageDialogOpen} onOpenChange={handleDialogChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert image from URL</DialogTitle>
              <DialogDescription>
                Paste a publicly accessible image URL. The image will be
                centered in the email.
              </DialogDescription>
            </DialogHeader>

            <form
              className="grid gap-4 py-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleInsertImage();
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="email-image-url">Image URL</Label>
                <Input
                  id="email-image-url"
                  type="url"
                  required
                  placeholder="https://example.com/photo.png"
                  value={imageSrc}
                  onChange={(e) => setImageSrc(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email-image-alt">Alt text (optional)</Label>
                <Input
                  id="email-image-alt"
                  placeholder="Describe the image"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                />
              </div>

              <DialogFooter className="sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!imageSrc.trim()}>
                  Insert image
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);
EmailComposer.displayName = "EmailComposer";

export { EmailComposer };

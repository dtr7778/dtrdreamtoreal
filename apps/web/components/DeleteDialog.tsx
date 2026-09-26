"use client";

import { useState } from "react";

import { CircleAlertIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

interface DeleteDialogProps {
  openDeleteDialog: boolean;
  setOpenDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>;
  onDelete: () => void;
  isDisable?: boolean;
}

export function DeleteDialog({
  openDeleteDialog,
  setOpenDeleteDialog,
  onDelete,
  isDisable,
}: DeleteDialogProps) {
  const [inputValue, setInputValue] = useState("");

  const handleDelete = () => {
    onDelete();
    setInputValue("");
  };

  return (
    <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
      <AlertDialogContent>
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <CircleAlertIcon className="opacity-80" size={16} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="sm:text-center">
              Final confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="sm:text-center">
              This action cannot be undone. Are you sure to delete. To confirm,
              please enter{" "}
              <span className="font-semibold text-foreground">CONFIRM</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <div className="space-y-5">
          <div className="*:not-first:mt-2">
            <Input
              type="text"
              placeholder="Type CONFIRM"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              render={
                <Button type="button" variant="outline" className="flex-1">
                  Cancel
                </Button>
              }
            />
            <Button
              type="button"
              className="flex-1"
              disabled={isDisable || inputValue !== "CONFIRM"}
              aria-disabled={isDisable || inputValue !== "CONFIRM"}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import { useCallback, useState } from "react";

import { orpcTQClient } from "#/server/orpc";
import { resolveUserImage } from "#/utils/resolveUserImage";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { UserSearch } from "lucide-react";

import { formatEnumValue, strInitials } from "@workspace/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { QueryStateBoundary } from "@workspace/ui/components/tanstack-query/query-state-boundary";
import { useDebouncedCallback } from "@workspace/ui/hooks/use-debounced-callback";

import { useCreateRoom } from "../../api/chat.api.hook";

export function ChatRoomCreateDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const [search, setSearch] = useState<string | undefined>(undefined);

  const navigate = useNavigate();
  const createRoom = useCreateRoom();

  const { data, isLoading, isError, error, refetch } = useQuery(
    orpcTQClient.user.listUserForSearch.queryOptions({
      input: { search, searchFields: ["name", "email"] },
      enabled: open,
      select: (result) => result.data,
    })
  );

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setSearch(value.trim() || undefined);
  }, 500);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setSearch(undefined);
  }, []);

  const handleSelect = useCallback(
    (userId: string) => {
      createRoom.mutate(
        { userId },
        {
          onSuccess: ({ data: room }) => {
            setOpen(false);
            void navigate({
              to: "/chat/$chatRoomId",
              params: { chatRoomId: room.id },
            });
          },
        }
      );
    },
    [createRoom, navigate]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New conversation</DialogTitle>
          <DialogDescription>
            Select someone to start a direct conversation with.
          </DialogDescription>
        </DialogHeader>
        <Command shouldFilter={false} className="bg-transparent p-0">
          <CommandInput
            placeholder="Search people..."
            onValueChange={debouncedSetSearch}
            inputMode="search"
            autoCapitalize="none"
          />
          <QueryStateBoundary
            data={data}
            isLoading={isLoading}
            isError={isError}
            error={error}
            isEmpty={(users) => users.length === 0}
            loadingFallback={
              <div className="space-y-2 p-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-1 py-1.5"
                  >
                    <Skeleton className="size-8 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-2.5 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            }
            emptyFallback={
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                <UserSearch className="size-8 opacity-20" aria-hidden="true" />
                <span className="text-sm">No users to start a chat with</span>
              </div>
            }
            errorFallback={() => (
              <div
                role="alert"
                className="p-6 text-center text-sm text-muted-foreground"
              >
                <p className="mb-3">Couldn’t load users.</p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Try again
                </Button>
              </div>
            )}
          >
            {(users) => (
              <CommandList className="max-h-70">
                <CommandGroup>
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.id}
                      disabled={createRoom.isPending}
                      onSelect={() => handleSelect(user.id)}
                      className="cursor-pointer"
                    >
                      <div className="relative inline-flex items-center gap-2 text-left">
                        <Avatar className="size-8">
                          <AvatarImage
                            src={resolveUserImage(user.image)}
                            alt={user.name}
                          />
                          <AvatarFallback className="text-xs font-semibold uppercase">
                            {strInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left leading-tight">
                          <div className="text-sm font-medium">{user.name}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {user.roles
                              .map((role) => formatEnumValue(role.roleName))
                              .join(", ")}
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            )}
          </QueryStateBoundary>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

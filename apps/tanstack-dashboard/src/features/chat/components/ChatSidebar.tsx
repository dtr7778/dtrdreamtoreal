import { useState } from "react";

import { useQuerySearch } from "#/hooks/use-query-search";
import { orpcTQClient } from "#/server/orpc";
import { useQuery } from "@tanstack/react-query";
import {
  AtSign,
  MessageSquare,
  MessageSquarePlus,
  MessagesSquare,
  Search,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { QueryStateBoundary } from "@workspace/ui/components/tanstack-query/query-state-boundary";
import { useDebouncedCallback } from "@workspace/ui/hooks/use-debounced-callback";

import { ConversationItem } from "./ConversationItem";
import { ChatGroupCreateDialog } from "./dialogs/ChatGroupCreateDialog";
import { ChatRoomCreateDialog } from "./dialogs/ChatRoomCreateDialog";

export function ChatSidebar() {
  const [chatRoomDialog, setChatRoomDialog] = useState<boolean>(false);
  const [chatGroupDialog, setChatGroupDialog] = useState<boolean>(false);
  const [searchInputValue, setSearchInputValue] = useState("");

  const { filters, setSearchFilter } = useQuerySearch(
    "/(dashboard)/_dashboardLayout/chat/_chatLayout"
  );

  const conversationQuery = useQuery(
    orpcTQClient.chat.listConversation.queryOptions({
      input: {
        search: filters?.search,
      },
      select: (data) => ({
        group: data.data.filter(
          (conversation) => conversation.type === "group"
        ),
        direct: data.data.filter(
          (conversation) => conversation.type === "direct"
        ),
      }),
    })
  );

  const debouchedSearch = useDebouncedCallback(
    (updatedValue: string) => setSearchFilter(updatedValue),
    300
  );

  const handleSearch = (
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>
  ) => {
    const value = e.target.value;
    setSearchInputValue(value);
    debouchedSearch(value);
  };

  return (
    <Sidebar className="absolute h-full" collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex h-8 items-center gap-2 px-2">
          <MessageSquare className="size-4 shrink-0" />
          <h2 className="flex-1 truncate text-base font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Message
          </h2>
        </div>
        <div className="group-data-[collapsible=icon]:hidden">
          <InputGroup>
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              value={searchInputValue}
              onChange={handleSearch}
              placeholder="Search conversations"
              aria-label="Search conversations"
            />
          </InputGroup>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <QueryStateBoundary
          data={conversationQuery.data}
          isLoading={conversationQuery.isLoading}
          isError={conversationQuery.isError}
          error={conversationQuery.error}
          isEmpty={(d) => d.group.length === 0 && d.direct.length === 0}
          loadingFallback={
            <div className="flex flex-col">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 px-3 py-3">
                  <Skeleton className="size-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-1/2" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          }
          emptyFallback={
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageSquarePlus aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>
                  {filters?.search ? "No matches" : "No conversations"}
                </EmptyTitle>
                <EmptyDescription>
                  {filters?.search
                    ? "Try a different search term."
                    : "Conversations you take part in will appear here."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          }
          errorFallback={() => (
            <div
              role="alert"
              className="p-2 text-center text-sm text-muted-foreground"
            >
              <p className="mb-3">Couldn’t load conversations.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => conversationQuery.refetch()}
              >
                Try again
              </Button>
            </div>
          )}
        >
          {(conversations) => (
            <>
              {conversations.group.length > 0 && (
                <SidebarGroup>
                  <SidebarGroupLabel>Groups</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {conversations.group.map((conversation) => (
                        <ConversationItem
                          key={conversation.roomId}
                          conversation={conversation}
                        />
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )}
              {conversations.direct.length > 0 && (
                <SidebarGroup>
                  <SidebarGroupLabel>Direct messages</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {conversations.direct.map((conversation) => (
                        <ConversationItem
                          key={conversation.roomId}
                          conversation={conversation}
                        />
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )}
            </>
          )}
        </QueryStateBoundary>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => setChatRoomDialog(true)}>
              <AtSign />
              <span>New Conversation</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => setChatGroupDialog(true)}>
              <MessagesSquare />
              <span>New Group</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <ChatRoomCreateDialog open={chatRoomDialog} setOpen={setChatRoomDialog} />
      <ChatGroupCreateDialog
        open={chatGroupDialog}
        setOpen={setChatGroupDialog}
      />
    </Sidebar>
  );
}

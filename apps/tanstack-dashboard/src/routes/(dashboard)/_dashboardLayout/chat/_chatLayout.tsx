import { ChatSidebar } from "#/features/chat/components/ChatSidebar";
import { env } from "#/lib/env";
import { orpcTQClient } from "#/server/orpc";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import z from "zod";

import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";

export const Route = createFileRoute(
  "/(dashboard)/_dashboardLayout/chat/_chatLayout"
)({
  head: () => ({
    meta: [
      { title: `Messages | Dashboard - ${env.VITE_APP_NAME}` },
      {
        name: "description",
        content: `Chats and conversations in ${env.VITE_APP_NAME}.`,
      },
    ],
  }),
  validateSearch: z.object({
    search: z.string().optional(),
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ context: { queryClient }, deps }) => {
    await queryClient.query(
      orpcTQClient.chat.listConversation.queryOptions({
        input: {
          search: deps.search,
        },
      })
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "20rem",
        } as React.CSSProperties
      }
      className="min-h-0 relative overflow-hidden h-[calc(100dvh-56px)]"
    >
      <ChatSidebar />
      <SidebarInset>
        <main className="flex min-w-0 flex-1 flex-col h-full">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

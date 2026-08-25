import { SerwistProvider } from "@serwist/turbopack/react";

import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";

import { AppSidebar } from "@/components/shared/sidebar/AppSidebar";
import { Topbar } from "@/components/shared/topbar";

import { NotificationPermissionProvider } from "@/features/notification/components/NotificationPermissionProvider";
import { NotificationProvider } from "@/features/notification/components/NotificationProvider";

export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  return (
    <SerwistProvider swUrl="/serwist/sw.js">
      <NotificationPermissionProvider>
        <NotificationProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <Topbar />
              <main className="min-h-[calc(100vh-84px)] flex-1">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </NotificationProvider>
      </NotificationPermissionProvider>
    </SerwistProvider>
  );
}

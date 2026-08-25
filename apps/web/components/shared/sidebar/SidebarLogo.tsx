import Link from "next/link";

import { GalleryVerticalEnd } from "lucide-react";

import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";

import { env } from "@/lib/env";

export function SidebarLogo() {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        size="lg"
        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        render={
          <Link href={{ pathname: "/dashboard" }}>
            <span className="inline-flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </span>
            <span className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {env.NEXT_PUBLIC_SITE_NAME}
              </span>
              <span className="truncate text-xs">Platfrom</span>
            </span>
          </Link>
        }
      />
    </SidebarMenuItem>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";

import { settingsMenuLinks } from "@/constants/sidebarLinks";

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="lg:w-1/5">
      <SidebarGroup className="p-0">
        <SidebarMenu className="flex-row flex-wrap gap-2 lg:flex-col">
          {settingsMenuLinks.map((menuLink) => (
            <SidebarMenuItem key={menuLink.path}>
              <SidebarMenuButton
                isActive={pathname === menuLink.path}
                tooltip={menuLink.title}
                render={
                  <Link href={{ pathname: menuLink.path }}>
                    <span className="truncate">{menuLink.title}</span>
                  </Link>
                }
              />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </aside>
  );
}

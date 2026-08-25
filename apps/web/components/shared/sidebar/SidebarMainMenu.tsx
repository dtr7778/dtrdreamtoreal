"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@workspace/ui/components/sidebar";

import { sidebarMenuLinks } from "@/constants/sidebarLinks";
import { useAuthStore } from "@/stores/zustand/auth/AuthStoreContext";
import { filterSidebarMenu } from "@/utils/filterSidebarMenu";

import { NestedMenuItem } from "./NestedMenuItem";

export function SidebarMainMenu() {
  "use no memo";
  const pathname = usePathname();

  const permissions = useAuthStore((state) => state.permissions);
  const authUser = useAuthStore((state) => state.user!);

  const sidebarLinks = useMemo(
    () => filterSidebarMenu(sidebarMenuLinks, permissions, authUser.id),
    [permissions, authUser.id]
  );

  return (
    <>
      {sidebarLinks.map(({ groupName, items }, idx) => (
        <SidebarGroup key={`sidebar-group-${idx}`}>
          {groupName && <SidebarGroupLabel>{groupName}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((menuLink, idx) => (
                <NestedMenuItem
                  pathname={pathname}
                  key={`nav-${idx}`}
                  menuLink={menuLink}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}

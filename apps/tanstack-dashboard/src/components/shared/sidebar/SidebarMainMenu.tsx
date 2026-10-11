import { useMemo } from "react";

import { sidebarMenuLinks } from "#/constants/sidebarLinks";
import { useAuthStore } from "#/stores/zustand/auth/AuthStoreContext";
import { useLocation } from "@tanstack/react-router";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@workspace/ui/components/sidebar";

import { filterSidebarMenu } from "./filterSidebarMenu";
import { NestedMenuItem } from "./NestedMenuItem";

export function SidebarMainMenu() {
  "use no memo";
  const { pathname } = useLocation();

  const permissions = useAuthStore((state) => state.permissions);
  const authUser = useAuthStore((state) => state.user);

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
              {items.map((menuLink, menuIdx) => (
                <NestedMenuItem
                  pathname={pathname}
                  key={`nav-${idx}-${menuIdx}`}
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

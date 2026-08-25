import Link from "next/link";

import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar";

import { SidebarMenuLinkType } from "@/types";

export function NestedMenuItem({
  menuLink,
  pathname,
  isSubMenu = false,
}: {
  menuLink: SidebarMenuLinkType;
  pathname: string;
  isSubMenu?: boolean;
}) {
  const hasChildren = menuLink.items && menuLink.items.length > 0;

  const isActive = menuLink.pathRegex.test(pathname);

  if (!hasChildren) {
    const MainSidebarMenuItem = isSubMenu
      ? SidebarMenuSubItem
      : SidebarMenuItem;
    const MainSidebarMenuButton = isSubMenu
      ? SidebarMenuSubButton
      : SidebarMenuButton;

    return (
      <MainSidebarMenuItem>
        <MainSidebarMenuButton
          isActive={isActive}
          tooltip={menuLink.title}
          render={
            <Link href={{ pathname: menuLink.path }}>
              {menuLink.icon && <menuLink.icon />}
              <span className="truncate">{menuLink.title}</span>
            </Link>
          }
        />
      </MainSidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible defaultOpen={isActive} className="group/collapsible">
        <CollapsibleTrigger
          render={
            <SidebarMenuButton
              tooltip={menuLink.title}
              className="cursor-pointer"
              isActive={isActive}
            />
          }
        >
          {menuLink.icon && <menuLink.icon />}
          <span className="truncate">{menuLink.title}</span>
          <ChevronRight className="ml-auto transition-transform group-data-open/collapsible:rotate-90" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {menuLink.items?.map((child) => (
              <NestedMenuItem
                key={child.path}
                pathname={pathname}
                menuLink={child}
                isSubMenu
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}

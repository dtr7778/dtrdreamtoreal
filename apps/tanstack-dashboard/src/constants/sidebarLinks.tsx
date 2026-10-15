import type { SidebarGroupMenuLinkType, SidebarMenuLinkType } from "#/types";
import {
  Bell,
  House,
  MessageSquare,
  Settings,
  ShieldUser,
  User,
  UsersRound,
} from "lucide-react";

export const sidebarMenuLinks: Array<SidebarGroupMenuLinkType> = [
  {
    groupName: "Overview",
    items: [
      {
        title: "Dashboard",
        icon: <House />,
        path: "/",
        pathRegex: /\//,
      },
      {
        title: "Chat",
        icon: <MessageSquare />,
        path: "/chat",
        pathRegex: /^\/chat(\/.*)?$/,
      },
    ],
  },
  {
    groupName: "Administration",
    items: [
      {
        title: "All Users",
        icon: <UsersRound />,
        permissions: ["system.user.manage", "system.user.list"],
        path: "/users",
        pathRegex: /^\/users(\/.*)?$/,
      },
      {
        title: "Roles & Permissions",
        icon: <ShieldUser />,
        permissions: [
          "system.role_permission.manage",
          "system.role_permission.list",
        ],
        path: "/roles",
        pathRegex: /^\/roles$/,
      },
    ],
  },
];

export const footerMenuLinks: Array<SidebarMenuLinkType> = [
  {
    title: "My Profile",
    icon: <User />,
    path: "/profile",
    pathRegex: /^\/profile$/,
  },
  {
    title: "Notifications",
    icon: <Bell />,
    path: "/notifications",
    pathRegex: /^\/notifications$/,
  },
  {
    title: "Settings",
    icon: <Settings />,
    path: "/settings",
    pathRegex: /^\/settings$/,
  },
];

export const settingsMenuLinks: Array<{ title: string; path: string }> = [
  {
    title: "Profile",
    path: "/settings/profile",
  },
  {
    title: "Notification",
    path: "/settings/notification",
  },
  {
    title: "Update Password",
    path: "/settings/update-password",
  },
  {
    title: "Sessions",
    path: "/settings/sessions",
  },
  {
    title: "Connected Apps",
    path: "/settings/connected-apps",
  },
];

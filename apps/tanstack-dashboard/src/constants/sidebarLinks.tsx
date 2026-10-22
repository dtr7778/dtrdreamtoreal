import type { SidebarGroupMenuLinkType, SidebarMenuLinkType } from "#/types";
import {
  Bell,
  ClipboardList,
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
      {
        title: "Tasks",
        icon: <ClipboardList />,
        path: "/tasks",
        pathRegex: /^\/tasks(\/.*)?$/,
        items: [
          {
            title: "All Tasks",
            path: "/tasks",
            pathRegex: /^\/tasks$/,
          },
          {
            title: "Personal Tasks",
            path: "/tasks/personal",
            pathRegex: /^\/tasks\/personal$/,
          },
        ],
      },
    ],
  },
  {
    groupName: "Administration",
    items: [
      {
        title: "All Users",
        icon: <UsersRound />,
        permissions: [
          { level: "system", resource: "user", action: "manage" },
          { level: "system", resource: "user", action: "list" },
        ],
        path: "/users",
        pathRegex: /^\/users(\/.*)?$/,
      },
      {
        title: "Roles & Permissions",
        icon: <ShieldUser />,
        permissions: [
          { level: "system", resource: "role_permission", action: "manage" },
          { level: "system", resource: "role_permission", action: "list" },
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

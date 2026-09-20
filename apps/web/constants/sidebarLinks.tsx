import { ContactIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building2,
  ClipboardList,
  House,
  ListTree,
  MessagesSquare,
  Settings,
  ShieldUser,
  User,
  UserSquare,
  UsersRound,
} from "lucide-react";

import type { SidebarGroupMenuLinkType, SidebarMenuLinkType } from "@/types";

export const sidebarMenuLinks: Array<SidebarGroupMenuLinkType> = [
  {
    groupName: "Dashboard",
    items: [
      {
        title: "Dashboard",
        icon: <House />,
        path: "/dashboard",
        pathRegex: /^\/dashboard$/,
      },
      {
        title: "Companies",
        icon: <Building2 />,
        permissions: [
          "system.company.manage",
          "system.company.list",
          "system.company_employee.manage",
          "system.company_employee.list",
        ],
        path: "/dashboard/companies",
        pathRegex: /^\/dashboard\/companies(\/.*)?$/,
        items: [
          {
            title: "All campanies",
            icon: <ListTree />,
            path: "/dashboard/companies/",
            permissions: ["system.company.manage", "system.company.list"],
            pathRegex: /^\/dashboard\/companies(\/.*)?$/,
          },
          {
            title: "All employees",
            icon: <UserSquare />,
            path: "/dashboard/employees/",
            permissions: [
              "system.company_employee.manage",
              "system.company_employee.list",
            ],
            pathRegex: /^\/dashboard\/employees(\/.*)?$/,
          },
        ],
      },
      {
        title: "Tasks",
        icon: <ClipboardList />,
        permissions: ["system.task.manage", "system.task.list"],
        path: "/dashboard/tasks",
        pathRegex: /^\/dashboard\/tasks(\/.*)?$/,
      },
      {
        title: "Message",
        icon: <MessagesSquare />,
        path: "/dashboard/message",
        pathRegex: /^\/dashboard\/message(\/.*)?$/,
      },
      {
        title: "Contacts",
        icon: <HugeiconsIcon icon={ContactIcon} />,
        permissions: ["system.contact.manage", "system.contact.list"],
        path: "/dashboard/contacts",
        pathRegex: /^\/dashboard\/contacts(\/.*)?$/,
      },
      {
        title: "All Users",
        icon: <UsersRound />,
        permissions: ["system.user.manage", "system.user.list"],
        path: "/dashboard/users",
        pathRegex: /^\/dashboard\/users(\/.*)?$/,
      },
      {
        title: "Roles & Permissions",
        icon: <ShieldUser />,
        permissions: [
          "system.role-permission.manage",
          "system.role-permission.list",
        ],
        path: "/dashboard/roles",
        pathRegex: /^\/dashboard\/roles$/,
      },
    ],
  },
];

export const footerMenuLinks: Array<SidebarMenuLinkType> = [
  {
    title: "My Profile",
    icon: <User />,
    path: "/dashboard/profile",
    pathRegex: /^\/dashboard\/profile$/,
  },
  {
    title: "Settings",
    icon: <Settings />,
    path: "/dashboard/settings",
    pathRegex: /^\/dashboard\/settings$/,
  },
];

export const settingsMenuLinks: Array<{ title: string; path: string }> = [
  {
    title: "Profile",
    path: "/dashboard/settings/profile",
  },
  {
    title: "Notification",
    path: "/dashboard/settings/notification",
  },
  {
    title: "Update Password",
    path: "/dashboard/settings/update-password",
  },
  {
    title: "Sessions",
    path: "/dashboard/settings/sessions",
  },
  {
    title: "Connected Apps",
    path: "/dashboard/settings/connected-apps",
  },
];

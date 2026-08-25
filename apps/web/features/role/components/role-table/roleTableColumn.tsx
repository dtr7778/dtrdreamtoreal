import { UsersRound } from "lucide-react";

import { formatEnumValue } from "@workspace/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header";
import type { ColumnType } from "@workspace/ui/types/data-table";

import { ListRoleContractType } from "../../api/role.contract";
import { PermissionsCell } from "./PermissionsCell";

type RoleTableRowDataType = ListRoleContractType["output"]["data"][number];

export const roleTableColumn: ColumnType<RoleTableRowDataType> = [
  {
    id: "roleName",
    accessorKey: "roleName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Role" />
    ),
    cell: ({ getValue }) => (
      <div className="text-sm font-semibold">
        {formatEnumValue(getValue<RoleTableRowDataType["roleName"]>())}
      </div>
    ),
    enableHiding: false,
    enableColumnFilter: false,
    enableSorting: false,
  },
  {
    id: "description",
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Description" />
    ),
    cell: ({ getValue }) => (
      <div>{getValue<RoleTableRowDataType["description"]>()}</div>
    ),
    enableSorting: false,
  },
  {
    id: "totalUsers",
    accessorKey: "totalUsers",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Total Users" />
    ),
    cell: ({ getValue }) => (
      <Badge variant="outline">
        <UsersRound />
        <span>{`${getValue<RoleTableRowDataType["totalUsers"]>()} users`}</span>
      </Badge>
    ),
    enableSorting: false,
  },
  {
    id: "permissions",
    accessorKey: "permissions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Permissions" />
    ),
    cell: ({ getValue }) => (
      <PermissionsCell
        permissions={getValue<RoleTableRowDataType["permissions"]>()}
      />
    ),
    meta: {
      label: "Permissions",
    },
    enableHiding: false,
    enableColumnFilter: false,
    enableSorting: false,
  },
];

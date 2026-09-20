import Link from "next/link";

import { Badge } from "@workspace/ui/components/badge";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header";
import type { ColumnType } from "@workspace/ui/types/data-table";

import { FormatDateCell } from "@/components/format-date/FormatDateCell";

import { ListEmployeeContractType } from "../../api/employee.contract";
import EmployeeTableRowAction from "./EmployeeTableRowAction";

type EmployeeTableRowDataType =
  ListEmployeeContractType["output"]["data"]["data"][number];

export const employeeTableColumn: ColumnType<EmployeeTableRowDataType> = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          !!table.getIsSomePageRowsSelected()
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "firstName",
    accessorKey: "firstName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Name" />
    ),
    cell: ({ row }) => {
      const { firstName, middleName, lastName } = row.original;
      const fullName = [firstName, middleName, lastName]
        .filter(Boolean)
        .join(" ");
      return (
        <div>
          <div>
            <Link
              href={{ pathname: `/dashboard/employees/${row.original.id}` }}
              className="link"
            >
              {fullName}
            </Link>
          </div>
          <div className="text-muted-foreground">{row.original.jobTitle}</div>
        </div>
      );
    },
    meta: { label: "Name" },
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: "company",
    accessorKey: "company",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Company" />
    ),
    cell: ({ getValue, row }) => {
      const company = getValue<EmployeeTableRowDataType["company"]>();
      return company ? (
        <Badge
          variant="secondary"
          className="link"
          render={
            <Link
              href={{
                pathname: `/dashboard/companies/${row.original.company.id}`,
              }}
            />
          }
        >
          {company.name}
        </Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
    meta: { label: "Company" },
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: "contact",
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Contact" />
    ),
    cell: ({ getValue, row }) => {
      const email = getValue<EmployeeTableRowDataType["email"]>();
      return (
        <div>
          {email && <div>{email}</div>}
          {row.original.phone && <div>{row.original.phone}</div>}
        </div>
      );
    },
    meta: { label: "Contact" },
    enableSorting: false,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Created" />
    ),
    cell: ({ getValue }) => {
      return (
        <Badge variant="secondary">
          <FormatDateCell
            format="PP"
            value={getValue<EmployeeTableRowDataType["createdAt"]>()}
          />
        </Badge>
      );
    },
    meta: { label: "Created" },
  },
  {
    id: "actions",
    cell: ({ row }) => <EmployeeTableRowAction employeeData={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];

import Link from "next/link";

import { Users } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header";
import type { ColumnType } from "@workspace/ui/types/data-table";

import { FormatDateCell } from "@/components/format-date/FormatDateCell";

import { ListCompanyContractType } from "../../api/company.contract";
import { CompanyTableRowAction } from "./CompanyTableRowAction";

type CompanyTableRowDataType =
  ListCompanyContractType["output"]["data"]["data"][number];

export const companyTableColumn: ColumnType<CompanyTableRowDataType> = [
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
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Company Name" />
    ),
    cell: ({ getValue, row }) => (
      <div className="leading-tight">
        <div className="flex items-center gap-1">
          <Link
            href={{
              pathname: `/dashboard/companies/${row.original.id}`,
            }}
            className="font-medium link"
          >
            {getValue<CompanyTableRowDataType["name"]>()}
          </Link>
          {row.original.industry && (
            <Badge variant="secondary">{row.original.industry}</Badge>
          )}
        </div>
        {row.original.legalName && (
          <div className="text-muted-foreground">{row.original.legalName}</div>
        )}
        <Link
          href={{
            pathname: `/dashboard/companies/${row.original.id}`,
            query: {
              tab: "employees",
            },
          }}
          className="flex items-center gap-1 text-muted-foreground"
        >
          <Users className="size-2.5" />
          <span className="link">{`${row.original.employeeCount} of ${row.original.employSize || 0}`}</span>
        </Link>
        {row.original.website && (
          <div>
            <a
              href={row.original.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 link"
            >
              {row.original.website.replace(/^https?:\/\//, "")}
            </a>
          </div>
        )}
      </div>
    ),
    meta: { label: "Company Name" },
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: "contact",
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Contact" />
    ),
    cell: ({ getValue, row }) => {
      const email = getValue<CompanyTableRowDataType["email"]>();
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
            value={getValue<CompanyTableRowDataType["createdAt"]>()}
          />
        </Badge>
      );
    },
    meta: { label: "Created" },
  },
  {
    id: "actions",
    cell: ({ row }) => <CompanyTableRowAction companyData={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];

import Link from "next/link";

import { ContactStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header";
import { ColumnType } from "@workspace/ui/types/data-table";

import { FormatDateCell } from "@/components/format-date/FormatDateCell";

import { ListContactContractType } from "../../api/contact.contract";
import { ContactStatusBadge } from "../ContactStatusBadge";

type ContactTableRowDataType =
  ListContactContractType["output"]["data"]["data"][number];

export const contactTableColumn: ColumnType<ContactTableRowDataType> = [
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
    id: "subject",
    accessorKey: "subject",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Subject" />
    ),
    cell: ({ getValue, row }) => (
      <Link
        className="max-w-75 truncate link"
        href={{ pathname: `/dashboard/contacts/${row.original.id}` }}
      >
        {getValue<ContactTableRowDataType["subject"]>()}
      </Link>
    ),
    meta: { label: "Subject" },
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: "contactUser",
    accessorKey: "contactUser",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Submitted user" />
    ),
    cell: ({ getValue }) => {
      const contactUser = getValue<ContactTableRowDataType["contactUser"]>();
      return (
        <div className="leading-tight">
          <div className="font-medium">{`${contactUser.name}`}</div>
          <div className="truncate text-muted-foreground">
            {contactUser.email}
          </div>
        </div>
      );
    },
    meta: { label: "Submitted user" },
    enableSorting: false,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Status" />
    ),
    cell: ({ getValue }) => {
      return (
        <ContactStatusBadge
          status={getValue<ContactTableRowDataType["status"]>()}
        />
      );
    },
    meta: {
      label: "Status",
      variant: "select",
      options: ContactStatusEnumSchema.options.map((status) => ({
        label: formatEnumValue(status),
        value: status,
      })),
    },
    enableColumnFilter: true,
    enableSorting: false,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Submitted" />
    ),
    cell: ({ getValue }) => {
      return (
        <FormatDateCell
          className="text-muted-foreground"
          value={getValue<ContactTableRowDataType["createdAt"]>()}
          format="dd MMM, yyyy hh:mm aa"
        />
      );
    },
    meta: { label: "Submitted" },
    enableSorting: false,
  },
];

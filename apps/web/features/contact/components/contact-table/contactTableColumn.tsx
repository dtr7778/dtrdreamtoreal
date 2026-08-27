import { CONTACT_SUBMISSION_STATUS } from "@workspace/drizzle/enum-values";
import { formatEnumValue } from "@workspace/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header";
import { ColumnType } from "@workspace/ui/types/data-table";

import { FormatDateCell } from "@/components/format-date/FormatDateCell";

import { ListContactContractType } from "../../api/contact.contract";

type ContactTableRowDataType =
  ListContactContractType["output"]["data"]["data"][number];

const statusVariantMap: Record<
  ContactTableRowDataType["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "secondary",
  READ: "outline",
  REPLIED: "default",
  SPAM: "destructive",
};

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
    cell: ({ getValue }) => (
      <div className="max-w-75 truncate">
        {getValue<ContactTableRowDataType["subject"]>()}
      </div>
    ),
    meta: { label: "Subject" },
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Submitted user" />
    ),
    cell: ({ getValue, row }) => (
      <div className="leading-tight">
        <div className="font-medium">
          {getValue<ContactTableRowDataType["name"]>()}
        </div>
        <div className="truncate text-muted-foreground">
          {row.original.email}
        </div>
      </div>
    ),
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
      const status = getValue<ContactTableRowDataType["status"]>();
      return (
        <Badge variant={statusVariantMap[status]}>
          {formatEnumValue(status)}
        </Badge>
      );
    },
    meta: {
      label: "Status",
      variant: "select",
      options: CONTACT_SUBMISSION_STATUS.map((status) => ({
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

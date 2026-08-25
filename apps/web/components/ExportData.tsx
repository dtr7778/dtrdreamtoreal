"use client";

import { Download, FileJson, FileSpreadsheet, Loader2 } from "lucide-react";

import { ExportFormat } from "@workspace/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

interface ExportDataProps {
  isLoading?: boolean;
  onExport: (format: ExportFormat) => void;
}

export function ExportData({ isLoading, onExport }: ExportDataProps) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={<Button variant="outline" disabled={isLoading} />}
            />
          }
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Download />}
          <span>Export</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export all data</p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onExport("csv")}>
            <FileSpreadsheet />
            <span>Export as CSV</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExport("json")}>
            <FileJson />
            <span>Export as JSON</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

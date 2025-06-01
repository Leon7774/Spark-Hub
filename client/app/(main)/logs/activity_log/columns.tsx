"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { ActivityLog } from "@/lib/schemas";
import { format } from "date-fns";

export const columns: ColumnDef<ActivityLog>[] = [
  {
    accessorKey: "id",
    header: () => <div className="text-center pl-0.5 bg-gray-100 p-0">ID</div>,
    cell: ({ row }) => (
      <div className="text-center bg-gray-100">{row.getValue("id")}</div>
    ),
    size: 5,
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="text-left font-medium">{row.getValue("action")}</div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => (
      <div className="text-left">
        {format(new Date(row.getValue("created_at")), "MMM d, yyyy h:mm a")}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Staff",
    cell: ({ row }) => <div className="text-left">{row.getValue("email")}</div>,
  },
  {
    id: "actions",
    cell: () => {
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-full w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-2 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Copy log ID</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem>Export log</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

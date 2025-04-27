"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Customer } from "@/utils/types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "id",
    header: "ID",
    size: 0,
    maxSize: 10,
  },
  {
    accessorKey: "first_name",
    header: "First Name",
    size:10,
  },
  {
    accessorKey: "last_name",
    header: "Last Name",
    maxSize: 70,
  },
  {
    accessorKey: "total_spent",
    header: "Total Spent",
    maxSize: 20,
  },
  {
    accessorKey: "total_hours",
    header: () => <div className="max-w-[10px]">Total Hours</div>,
    cell: ({ row }) => <div className="">{row.getValue("total_hours")}</div>,
    size:0,
    maxSize:20,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
              >
                Copy payment ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View customer</DropdownMenuItem>
              <DropdownMenuItem>View payment details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
];

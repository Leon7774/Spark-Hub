"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
    header: () => <div className="text-center pr-1.5">ID</div>,
    cell: ({ row }) => <div className="text-center">{row.getValue("id")}</div>,
    size: 15,
    minSize: 0,
  },
  {
    accessorKey: "first_name",
    header: () => <div className="">First Name</div>,
    size: 50,
  },
  {
    accessorKey: "last_name",
    header: "Last Name",
    maxSize: 50,
  },
  {
    accessorKey: "created_at",
    header: "Joined at",
    size: 70,
    cell: ({ row }) => {
      const value = row.getValue("created_at");
      const date = new Date(value);
      const formatted = date.toLocaleString(); // or .toLocaleString() if you want time too
      return <div>{formatted}</div>;
    },
  },
  {
    accessorKey: "total_spent",
    header: () => <div className="max-w-[10px]">Total Hours</div>,
    maxSize: 40,
  },
  {
    accessorKey: "total_hours",
    header: () => <div className="max-w-[10px]">Total Hours</div>,
    cell: ({ row }) => <div className="">{row.getValue("total_hours")}</div>,
    size: 40,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");

      if (status === "in session") {
        return (
          <div className="bg-green-500 w-[80px] p-1 text-center rounded-md">
            In Session
          </div>
        );
      } else {
        return (
          <div className="bg-gray-200 w-[80px] p-1 text-center rounded-md">
            Offline
          </div>
        );
      }
    },
    size: 30,
  },
  {
    id: "actions",
    cell: ({ row }) => {
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
              <DropdownMenuItem>Copy payment ID</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View customer</DropdownMenuItem>
              <DropdownMenuItem>View payment details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    size: 50,
  },
];

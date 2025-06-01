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
import Link from "next/link";
import { PhilippinePesoIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Customer & { isInSession: string }>[] = [
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
      const value: string = row.getValue("created_at");
      const date = new Date(value);
      const formatted = date.toLocaleString(); // or .toLocaleString() if you want time too
      return <div>{formatted}</div>;
    },
  },
  // TODO: Implement this
  // {
  //   accessorKey: "total_spent",
  //   header: () => <div className="max-w-[10px]">Total Spent</div>,
  //   cell: ({ row }) => (
  //     <div className="flex flex-row items-center">
  //       <PhilippinePesoIcon className="h-4 w-4" />
  //       {row.getValue("total_spent")}
  //     </div>
  //   ),
  //   maxSize: 40,
  // },
  // {
  //   accessorKey: "total_hours",
  //   header: () => <div className="max-w-[10px]">Total Hours</div>,
  //   cell: ({ row }) => <div className="">{row.getValue("total_hours")}</div>,
  //   size: 40,
  // },
  {
    accessorKey: "isInSession",
    header: "Status",
    cell: ({ row }) => {
      const isInSession = row.original.isInSession;
      return (
        <Badge
          variant={isInSession ? "default" : "secondary"}
          className={
            isInSession
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }
        >
          {isInSession ? "In Session" : "Offline"}
        </Badge>
      );
    },
    size: 40,
  },
  {
    id: "activity",
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
              <Link href={`/customers/${row.original.id}`}>
                <DropdownMenuItem>View customer</DropdownMenuItem>
              </Link>
              <DropdownMenuItem>View payment details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    size: 50,
  },
];

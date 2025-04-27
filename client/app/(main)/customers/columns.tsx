"use client";

import { Button } from "@/components/ui/button";
import { Customer } from "@/utils/types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { Divide } from "lucide-react";

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "id",
    header: "ID",
    size: 2,
  },
  {
    accessorKey: "first_name",
    header: "First Name",
    maxSize: 50,
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
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      <div className="text-right pl-10">{row.getValue("total_hours")}</div>;
    },
  },
  // {
  //   id: "actions",
  //   cell: ({ row }) => {
  //     const payment = row.original

  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" className="h-8 w-8 p-0">
  //             <span className="sr-only">Open menu</span>
  //             <MoreHorizontal className="h-4 w-4" />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end">
  //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //           <DropdownMenuItem
  //             onClick={() => navigator.clipboard.writeText(payment.id)}
  //           >
  //             Copy payment ID
  //           </DropdownMenuItem>
  //           <DropdownMenuSeparator />
  //           <DropdownMenuItem>View customer</DropdownMenuItem>
  //           <DropdownMenuItem>View payment details</DropdownMenuItem>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     )
  //   },
  // },
];

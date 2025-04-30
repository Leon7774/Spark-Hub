"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

type LogEntry = {
  id: number;
  date: string;
  staff: string;
  action: string;
};

export const subscriptions: LogEntry[] = [
  {
    id: 1,
    date: "9:15AM at 4/20/2025",
    staff: "Alex Cruz",
    action: "Register Customer",
  },
  {
    id: 2,
    date: "11:30AM at 4/21/2025",
    staff: "Maria Lopez",
    action: "Add New Plan",
  },
  {
    id: 3,
    date: "2:45PM at 4/22/2025",
    staff: "John Tan",
    action: "Delete Customer",
  },
  {
    id: 4,
    date: "4:05PM at 4/22/2025",
    staff: "Ella Reyes",
    action: "Register Customer",
  },
  {
    id: 5,
    date: "6:20PM at 4/23/2025",
    staff: "Rico Santos",
    action: "Update Plan Details",
  },
  {
    id: 6,
    date: "8:50AM at 4/24/2025",
    staff: "Maria Lopez",
    action: "Checkout Customer",
  },
  { id: 7, date: "10:10AM at 4/24/2025", staff: "Alex Cruz", action: "Login" },
  {
    id: 8,
    date: "12:00PM at 4/25/2025",
    staff: "Ella Reyes",
    action: "Logout",
  },
  {
    id: 9,
    date: "3:30PM at 4/26/2025",
    staff: "Rico Santos",
    action: "View Report",
  },
  {
    id: 10,
    date: "5:45PM at 4/27/2025",
    staff: "John Tan",
    action: "Register Customer",
  },
  {
    id: 11,
    date: "1:15PM at 4/28/2025",
    staff: "Maria Lopez",
    action: "Add New Plan",
  },
  {
    id: 12,
    date: "9:00AM at 4/29/2025",
    staff: "Ella Reyes",
    action: "Delete Plan",
  },
  {
    id: 13,
    date: "11:20AM at 4/29/2025",
    staff: "Alex Cruz",
    action: "Change Password",
  },
  {
    id: 14,
    date: "3:00PM at 4/30/2025",
    staff: "Rico Santos",
    action: "Checkout Customer",
  },
  {
    id: 15,
    date: "6:40PM at 4/30/2025",
    staff: "John Tan",
    action: "Register Customer",
  },
];

export const columns: ColumnDef<LogEntry>[] = [
  {
    accessorKey: "id",
    header: () => <div className="text-center pr-1 bg-gray-100">ID</div>,
    cell: ({ row }) => (
      <div className="text-center bg-gray-100">{row.getValue("id")}</div>
    ),
    size: 10,
    minSize: 8,
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <div className="text-left">{row.getValue("date")}</div>,
    size: 150,
  },
  {
    accessorKey: "staff",
    header: "Staff",
    cell: ({ row }) => <div className="text-left">{row.getValue("staff")}</div>,
    size: 150,
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="text-left font-medium">{row.getValue("action")}</div>
    ),
    size: 200,
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

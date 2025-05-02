"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

export type Subscription = {
  id: number;
  name: string;
  price: number;
  active: boolean;
};

export const subscriptions: Subscription[] = [
  {
    id: 5,
    name: "Plan350",
    price: 350,
    active: true,
  },
  {
    id: 6,
    name: "Weekly Plan",
    price: 420,
    active: false,
  },
];

export const columns: ColumnDef<Subscription>[] = [
  {
    accessorKey: "id",
    header: () => <div className="text-center pl-0.5 bg-gray-100">ID</div>,
    cell: ({ row }) => (
      <div className="text-center bg-gray-100">{row.getValue("id")}</div>
    ),
    size: 5,
    minSize: 0,
  },
  {
    accessorKey: "name",
    header: "Plan Name",
    cell: ({ row }) => (
      <div className="font-semibold">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("price") as number; // 👈 tell TypeScript this is a number
      const formatted = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(price);

      return <div className="text-right">{formatted}</div>;
    },
  },

  {
    accessorKey: "active",
    header: "Active",
    cell: ({ row }) => {
      const active = row.getValue("active");
      return (
        <span
          className={
            active ? "text-green-600 font-bold" : "text-gray-400 italic"
          }
        >
          {active ? "Yes" : "No"}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="text-right ">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 mr-4">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-2 w-4" />
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
  },
];

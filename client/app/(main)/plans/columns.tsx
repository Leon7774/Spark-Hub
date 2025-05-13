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
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { formatTimeDisplay } from "@/lib/utils";

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
    accessorKey: "plan_type",
    header: "Type",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("plan_type")}</div>
    ),
  },
  {
    accessorKey: "time_included",
    header: "Time",
    cell: ({ row }) => {
      const seconds = row.getValue("time_included") as number;
      return <div>{formatTimeDisplay(seconds)}</div>;
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      const formatted = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(price);

      return <div className="text-right">{formatted}</div>;
    },
  },
  {
    accessorKey: "is_active",
    header: "Active",
    cell: ({ row }) => {
      const active = row.getValue("is_active");
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
      const subscription = row.original;

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 mr-4">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-2 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Pencil className="mr-2 h-4 w-4" />
                Edit subscription
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete subscription
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

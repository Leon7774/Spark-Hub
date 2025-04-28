import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";

export const data: Payment[] = [
  {
    id: "m5gr84i9",
    plan: "monthly plan",
    status: "in session",
    name: "john",
  },
  {
    id: "m5gr84i9",
    plan: "monthly plan",
    status: "in session",
    name: "john",
  },
  {
    id: "3u1reuv4",
    plan: "hourly",
    status: "in session",
    name: "mike",
  },
  {
    id: "derv1ws0",
    plan: "monthly plan",
    status: "offline",
    name: "leon",
  },
  {
    id: "5kma53ae",
    plan: "plan 350",
    status: "offline",
    name: "marcellin",
  },
  {
    id: "bhqecj4p",
    plan: "hourly",
    status: "in session",
    name: "carla",
  },
  {
    id: "m5gr84i9",
    plan: "monthly plan",
    status: "in session",
    name: "john",
  },
  {
    id: "m5gr84i9",
    plan: "monthly plan",
    status: "in session",
    name: "john",
  },
  {
    id: "3u1reuv4",
    plan: "hourly",
    status: "in session",
    name: "mike",
  },
  {
    id: "derv1ws0",
    plan: "monthly plan",
    status: "offline",
    name: "leon",
  },
  {
    id: "5kma53ae",
    plan: "plan 350",
    status: "offline",
    name: "marcellin",
  },
  {
    id: "bhqecj4p",
    plan: "hourly",
    status: "in session",
    name: "carla",
  },
  {
    id: "m5gr84i9",
    plan: "monthly plan",
    status: "in session",
    name: "john",
  },
  {
    id: "m5gr84i9",
    plan: "monthly plan",
    status: "in session",
    name: "john",
  },
];

export type Payment = {
  id: string;
  plan: "hourly" | "plan 350" | "monthly plan";
  status: "in session" | "offline";
  name: string;
};

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "plan",
    header: () => <div className="text-right">Plan</div>,
    cell: ({ row }) => {
      const amount: string = row.getValue("plan");

      // // Format the amount as a dollar amount
      // const formatted = new Intl.NumberFormat("en-US", {
      //   style: "currency",
      //   currency: "USD",
      // }).format();

      return (
        <div className="text-right font-medium">
          {amount.toLocaleUpperCase()}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className="flex items-center justify-center outline-none focus-visible:ring-0"
          >
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

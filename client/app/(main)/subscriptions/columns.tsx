"use client";

import { ColumnDef } from "@tanstack/react-table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { SubscriptionActive } from "@/lib/schemas";

// Columns Definition
export const columns: ColumnDef<SubscriptionActive>[] = [
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
    accessorKey: "customer_id",
    header: "Customer ID",
  },
  {
    accessorKey: "plan_id",
    header: "Plan Name",
    // cell: (info: any) =>
    //   // Get the value of the plan - not yet implemented
    //   subscriptionPlans.find((plan) => plan.id === info.getValue())?.name,
  },
  {
    accessorKey: "expiry",
    header: "Expiry Date",
    cell: (info: any) => {
      try {
        const expiryDate = new Date(info.getValue());
        return expiryDate.toLocaleDateString();
      } catch (error) {
        return "Invalid Date";
      }
    },
  },
  {
    accessorKey: "timeLeft",
    header: "Time Left (days)",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="text-right ">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 mr-2">
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

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

// Type Definitions
export type SubscriptionPlan = {
  id: number;
  name: string;
  active: boolean;
  price: number;
  length: number;
  createdAt: Date;
  availableAt: string[];
};

// Changed to use an interface instead of a tuple type for better type safety
export interface SubscriptionActive {
  id: number;
  customer_id: number;
  plan_id: number;
  expiry: string; // Store date as string in ISO format
  timeLeft: number;
}

// Sample Data
const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 1,
    name: "Plan 350",
    active: true,
    price: 350,
    length: 30,
    createdAt: new Date("2025-01-01"),
    availableAt: ["Branch 1", "Branch 2"],
  },
  {
    id: 2,
    name: "Weekly Plan",
    active: true,
    price: 650,
    length: 60,
    createdAt: new Date("2025-02-01"),
    availableAt: ["Branch 1"],
  },
  {
    id: 3,
    name: "It's Sparkling Time",
    active: false,
    price: 1200,
    length: 90,
    createdAt: new Date("2024-12-01"),
    availableAt: ["Branch 2"],
  },
];

// Modified to use objects instead of arrays for better type safety
export const data: SubscriptionActive[] = [
  {
    id: 1,
    customer_id: 101,
    plan_id: 1,
    expiry: "2025-02-01",
    timeLeft: 10,
  },
  {
    id: 2,
    customer_id: 102,
    plan_id: 2,
    expiry: "2025-03-01",
    timeLeft: 30,
  },
  {
    id: 3,
    customer_id: 103,
    plan_id: 1,
    expiry: "2025-04-01",
    timeLeft: 60,
  },
  {
    id: 4,
    customer_id: 104,
    plan_id: 2,
    expiry: "2025-03-15",
    timeLeft: 15,
  },
  {
    id: 5,
    customer_id: 104,
    plan_id: 3,
    expiry: "2025-03-15",
    timeLeft: 15,
  },
];

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

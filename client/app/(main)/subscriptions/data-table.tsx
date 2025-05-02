"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
const activeSubscriptions: SubscriptionActive[] = [
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
const columns = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "customer_id",
    header: "Customer ID",
  },
  {
    accessorKey: "plan_id",
    header: "Plan Name",
    cell: (info: any) =>
      subscriptionPlans.find((plan) => plan.id === info.getValue())?.name,
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
];

export function ActiveSubscriptions() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Add state for plan name filter
  const [planNameFilter, setPlanNameFilter] = React.useState("");

  // Apply filter when planNameFilter changes
  React.useEffect(() => {
    if (planNameFilter) {
      table.getColumn("plan_id")?.setFilterValue(planNameFilter);
    } else {
      table.getColumn("plan_id")?.setFilterValue("");
    }
  }, [planNameFilter]);

  const table = useReactTable({
    columns,
    data: activeSubscriptions,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex">
          <Button variant="default" className="mr-5">
            Add Subscription
          </Button>
          <Input
            placeholder="Filter plan name..."
            className="max-w-sm"
            value={planNameFilter}
            onChange={(e) => setPlanNameFilter(e.target.value)}
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table className="table-auto">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "min-w-0",
                      header.column.id === "id" && "bg-secondary border-r"
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        cell.column.id === "id" && "bg-secondary border-r"
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No active subscriptions.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground text-sm">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="space-x-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

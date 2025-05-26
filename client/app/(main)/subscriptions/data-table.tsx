"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";

import BaseTable from "@/components/ui/base-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import {
  getCachedPlans,
  getCachedCustomers,
  shouldSyncData,
  syncDataFromSupabase,
} from "@/utils/cache/indexeddb";
import { format } from "date-fns";
import { toast } from "sonner";

interface SubscriptionData {
  id: string;
  customer: {
    id: number;
    name: string;
  };
  plan: {
    id: number;
    name: string;
    type: string;
  };
  start_date: string;
  end_date: string;
  hours_remaining: number;
  status: string;
}

const columns: ColumnDef<SubscriptionData>[] = [
  {
    accessorKey: "customer.name",
    header: "Customer",
    cell: ({ row }) => <div>{row.original.customer.name}</div>,
  },
  {
    accessorKey: "plan.name",
    header: "Plan",
    cell: ({ row }) => <div>{row.original.plan.name}</div>,
  },
  {
    accessorKey: "plan.type",
    header: "Type",
    cell: ({ row }) => (
      <div className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
        {row.original.plan.type}
      </div>
    ),
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ row }) => (
      <div>{format(new Date(row.original.start_date), "MMM d, yyyy")}</div>
    ),
  },
  {
    accessorKey: "end_date",
    header: "End Date",
    cell: ({ row }) => (
      <div>{format(new Date(row.original.end_date), "MMM d, yyyy")}</div>
    ),
  },
  {
    accessorKey: "hours_remaining",
    header: "Hours Remaining",
    cell: ({ row }) => <div>{row.original.hours_remaining}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.original.status === "active"
            ? "bg-green-100 text-green-800"
            : row.original.status === "expired"
            ? "bg-red-100 text-red-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {row.original.status}
      </div>
    ),
  },
];

export function ActiveSubscriptions() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [rowSelection, setRowSelection] = React.useState({});
  const [data, setData] = useState<SubscriptionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from cache
  useEffect(() => {
    async function loadData() {
      try {
        // Check if we need to sync data
        const needsSync = await shouldSyncData();
        if (needsSync) {
          await syncDataFromSupabase();
        }

        // Load plans and customers from cache
        const [plans, customers] = await Promise.all([
          getCachedPlans(),
          getCachedCustomers(),
        ]);

        // Transform the data into the format we need
        const subscriptionData: SubscriptionData[] = plans.map((plan) => ({
          id: plan.id.toString(),
          customer: {
            id: plan.id, // Using plan id as customer id for now
            name:
              customers.find((c) => c.id === plan.id)?.first_name +
                " " +
                customers.find((c) => c.id === plan.id)?.last_name || "Unknown",
          },
          plan: {
            id: plan.id,
            name: plan.name,
            type: plan.plan_type,
          },
          start_date: plan.time_valid_start,
          end_date: plan.time_valid_end,
          hours_remaining: plan.time_included,
          status: plan.is_active ? "active" : "expired",
        }));

        setData(subscriptionData);
      } catch (error) {
        console.error("Error loading subscription data:", error);
        toast.error("Failed to load subscription data");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const table = useReactTable({
    columns,
    data,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter by customer..."
            value={
              (table.getColumn("customer.name")?.getFilterValue() as string) ??
              ""
            }
            onChange={(event) =>
              table
                .getColumn("customer.name")
                ?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Input
            placeholder="Filter by plan..."
            value={
              (table.getColumn("plan.name")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("plan.name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <Button variant="default" className="mr-5">
          Add Subscription
        </Button>
      </div>
      <div className="rounded-md border">
        <BaseTable<SubscriptionData> table={table} padding={4} />
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

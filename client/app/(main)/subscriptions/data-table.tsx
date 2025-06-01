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
import { DataTableProps } from "@/utils/types";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import RegisterButton from "@/app/(main)/subscriptions/register-button";
import { TableLoading } from "@/app/(main)/plans/loading";

export function ActiveSubscriptions<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 15, // 👈 set your default rows per page here
  });

  const [rowSelection, setRowSelection] = React.useState({});

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
      pagination,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter by customer..."
            value={
              (table.getColumn("customer_name")?.getFilterValue() as string) ??
              ""
            }
            onChange={(event) =>
              table
                .getColumn("customer_name")
                ?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Input
            placeholder="Filter by plan..."
            value={
              (table.getColumn("plan_name")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("plan_name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <RegisterButton />
      </div>
      <div className="rounded-md border">
        {data.length > 0 ? (
          <BaseTable<TData> table={table} padding={0} />
        ) : (
          <TableLoading></TableLoading>
        )}
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

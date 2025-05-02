"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import RegisterButton from "./register-button";
import BaseTable from "@/components/ui/base-table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function LogTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  // Pagination
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 20, // 👈 change this to your desired default
  });

  const table = useReactTable({
    columns,
    data,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination, // 👈 add this
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
      pagination: {
        pageIndex: 0,
        pageSize: 30, // 👈 change this number
      },
    },
  });

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-4">
        <RegisterButton></RegisterButton>
        {/* <Input
          placeholder="Filter by anything..."
          value={globalFilter}
          className="max-w-sm"
        /> */}
      </div>
      <div className="rounded-md border">
        <BaseTable<TData> table={table}></BaseTable>
      </div>
      <div className="flex items-center justify-end py-4 text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="default"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="transition-colors"
          >
            Previous
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="transition-colors"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

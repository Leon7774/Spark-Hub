"use client";

import * as React from "react";
import {
  ColumnDef,
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
import BaseTable from "@/components/ui/base-table";
import { Subscription } from "./columns";
// Return when add log register
// import RegisterButton from "./register-button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
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
  const [globalFilter, setGlobalFilter] = React.useState<string>("");

  // Global filter function
  const globalFilterFn = (row: any, columnId: string, value: string) => {
    return row
      .getAllCells()
      .some((cell) => String(cell.getValue()).toLowerCase().includes(value));
  };

  const table = useReactTable({
    columns,
    data,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn, // Apply global filter across all columns
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleGlobalFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setGlobalFilter(event.target.value);
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-2">
        {/* ADD REGISTER LATER */}
        {/* <RegisterButton></RegisterButton> */}
        <Button variant="default" className="mr-2 mb-2">
          Add Subscription Plan
        </Button>
        <Input
          placeholder="Filter by anything..."
          value={globalFilter}
          onChange={handleGlobalFilterChange}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <BaseTable<TData> table={table} padding={4}></BaseTable>
      </div>
      <div className="flex items-center justify-between py-4 text-sm text-muted-foreground">
        <div>
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
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

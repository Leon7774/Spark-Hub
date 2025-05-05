"use client";

import * as React from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BaseTable from "@/components/ui/base-table";
import RegisterButton from "./register-button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-2">
        <RegisterButton></RegisterButton>
        <Input placeholder="Filter by anything..." className="max-w-sm" />
      </div>
      <div className="rounded-md border">
        <BaseTable<TData> table={table} padding={4}></BaseTable>
      </div>
      <div className="flex items-center justify-between py-4 text-sm text-muted-foreground">
        <div className="flex items-center justify-end w-full space-x-2">
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

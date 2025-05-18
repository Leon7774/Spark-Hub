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
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

interface ActionLog {
  id: string;
  user_id: string;
  action_type: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
  user: {
    email: string;
  } | null;
}

const columns: ColumnDef<ActionLog>[] = [
  {
    accessorKey: "created_at",
    header: "Timestamp",
    cell: ({ row }) => (
      <div>
        {format(new Date(row.original.created_at), "MMM d, yyyy HH:mm:ss")}
      </div>
    ),
  },
  {
    accessorKey: "user.email",
    header: "User",
    cell: ({ row }) => <div>{row.original.user?.email || "Unknown"}</div>,
  },
  {
    accessorKey: "action_type",
    header: "Action",
    cell: ({ row }) => (
      <div className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
        {row.original.action_type}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => <div>{row.original.description}</div>,
  },
  {
    accessorKey: "metadata",
    header: "Details",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {Object.entries(row.original.metadata || {})
          .filter(([key]) => key !== "timestamp")
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ")}
      </div>
    ),
  },
];

export function ActionLogsTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [rowSelection, setRowSelection] = React.useState({});
  const [data, setData] = useState<ActionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();

        // Get action logs with user email
        const { data: logs, error } = await supabase
          .from("action_logs")
          .select(
            `
            *,
            user:user_id (
              email
            )
          `
          )
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setData(logs || []);
      } catch (error) {
        console.error("Error loading action logs:", error);
        toast.error("Failed to load action logs");
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
            placeholder="Filter by user..."
            value={
              (table.getColumn("user.email")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("user.email")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Input
            placeholder="Filter by action..."
            value={
              (table.getColumn("action_type")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("action_type")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
      </div>
      <div className="rounded-md border">
        <BaseTable<ActionLog> table={table} padding={4} />
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

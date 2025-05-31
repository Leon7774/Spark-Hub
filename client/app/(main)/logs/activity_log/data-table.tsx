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
import { useState } from "react";
import { format } from "date-fns";

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

// Sample data for the activity activity_log
const sampleActionLogs: ActionLog[] = [
  {
    id: "1",
    user_id: "user1",
    action_type: "LOGIN",
    description: "User logged in",
    metadata: { ip: "192.168.1.1", browser: "Chrome" },
    created_at: new Date().toISOString(),
    user: { email: "john@example.com" },
  },
  {
    id: "2",
    user_id: "user2",
    action_type: "CREATE_SESSION",
    description: "Created new session",
    metadata: { customer: "Jane Smith", duration: "60min" },
    created_at: new Date(Date.now() - 3600000).toISOString(),
    user: { email: "sarah@example.com" },
  },
  {
    id: "3",
    user_id: "user1",
    action_type: "UPDATE_PROFILE",
    description: "Updated user profile",
    metadata: { field: "name", old: "John", new: "Johnny" },
    created_at: new Date(Date.now() - 7200000).toISOString(),
    user: { email: "john@example.com" },
  },
  {
    id: "4",
    user_id: "user3",
    action_type: "DELETE_SESSION",
    description: "Deleted session",
    metadata: { session_id: "sess_123", reason: "cancelled" },
    created_at: new Date(Date.now() - 10800000).toISOString(),
    user: { email: "mike@example.com" },
  },
  {
    id: "5",
    user_id: "user2",
    action_type: "ADD_NOTE",
    description: "Added session notes",
    metadata: { session_id: "sess_456", note_length: "150 chars" },
    created_at: new Date(Date.now() - 14400000).toISOString(),
    user: { email: "sarah@example.com" },
  },
];

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
    [],
  );
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    columns,
    data: sampleActionLogs,
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

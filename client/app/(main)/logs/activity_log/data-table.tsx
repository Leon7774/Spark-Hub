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
import { format } from "date-fns";
import useSWR from "swr";
import { z } from "zod";

// Export the schema so it can be used for runtime validation elsewhere
export const activityLogSchema = z.object({
  id: z.number(),
  created_at: z.string().datetime(),
  description: z.string(),
  action: z.string(),
  email: z.string().email(),
  total: z.number().int(),
});

// Type inference from the schema
export type ActivityLog = z.infer<typeof activityLogSchema>;

interface ActivityLogResponse {
  data: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const columns: ColumnDef<ActivityLog>[] = [
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
    accessorKey: "email",
    header: "User",
    cell: ({ row }) => <div>{row.original.email || "Unknown"}</div>,
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
        {row.original.action}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => <div>{row.original.description}</div>,
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">{row.original.total}</div>
    ),
  },
];

export function ActionLogsTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [rowSelection, setRowSelection] = React.useState({});
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);

  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const { data, error, isLoading } = useSWR<ActivityLogResponse>(
    `/api/log/activity?page=${page}&limit=${limit}`,
    fetcher,
  );

  const table = useReactTable({
    data: data?.data || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  if (error) return <div>Failed to load activity logs</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter by email..."
            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("email")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Input
            placeholder="Filter by action..."
            value={
              (table.getColumn("action")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("action")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
      </div>
      <div className="rounded-md border">
        <BaseTable table={table} padding={4} />
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground text-sm">
          Page {data?.pagination.page} of{" "}
          {Math.ceil(
            (data?.pagination.total || 0) / (data?.pagination.limit || limit),
          )}
        </div>
        <div className="space-x-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={
              !data ||
              page >=
                Math.ceil(
                  data.pagination.total / (data.pagination.limit || limit),
                )
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

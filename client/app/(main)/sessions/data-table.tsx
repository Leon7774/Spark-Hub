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

import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import RegisterButton from "./register-button";
import { useEffect, useState } from "react";
import { useDataContext } from "@/context/dataContext";
import { Session } from "../../../lib/schemas";
import { Badge } from "@/components/ui/badge";
import { enrichSessions } from "@/app/(main)/sessions/enrich";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Users, CheckCircle, MapPin, X } from "lucide-react";
import useSWR from "swr";

export const SessionsTable = () => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [data, setData] = useState<Session[]>([]);

  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const { data: rawSessionData, isLoading } = useSWR("/api/session", fetcher);
  const { data: customersData } = useSWR("/api/customer", fetcher);
  const { data: plansData } = useSWR("/api/plan", fetcher);
  const { data: subscriptionData } = useSWR("api/subscription", fetcher);

  useEffect(() => {
    if (rawSessionData && customersData && plansData && subscriptionData) {
      setData(
        enrichSessions(
          rawSessionData,
          customersData,
          plansData,
          subscriptionData,
        ).filter((s) => !s.end_time),
      );
    }
  }, [rawSessionData, customersData, plansData, subscriptionData]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Calculate stats
  const todaySessions = data.filter((s: Session) => {
    const start = new Date(s.start_time);
    const now = new Date();
    return (
      start.getDate() === now.getDate() &&
      start.getMonth() === now.getMonth() &&
      start.getFullYear() === now.getFullYear()
    );
  });

  const ongoingSessions = todaySessions.filter((s: Session) => {
    const end = s.end_time ? new Date(s.end_time) : null;
    return !end;
  });

  const endedSessions = todaySessions.filter((s: Session) => {
    const end = s.end_time ? new Date(s.end_time) : null;
    return end;
  });

  const obreroSessions = ongoingSessions.filter((s: Session) =>
    s.branch?.toLowerCase().includes("obrero"),
  ).length;

  const matinaSessions = ongoingSessions.filter((s: Session) =>
    s.branch?.toLowerCase().includes("matina"),
  ).length;

  const clearFilters = () => {
    table.resetColumnFilters();
  };

  const hasActiveFilters = columnFilters.length > 0;

  return (
    <div className="w-full space-y-6">
      {/* Compact Stats Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        {/* Total Sessions Today */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">
              Total Today
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {todaySessions.length}
          </div>
        </div>

        {/* Ongoing Sessions */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium text-green-700">Active</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {ongoingSessions.length}
          </div>
        </div>

        {/* Ended Sessions */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">Completed</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {endedSessions.length}
          </div>
        </div>

        {/* Obrero Branch */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-medium text-purple-700">Obrero</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {obreroSessions}
          </div>
        </div>

        {/* Matina Branch */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3 border border-emerald-200">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">Matina</span>
          </div>
          <div className="text-2xl font-bold text-emerald-900">
            {matinaSessions}
          </div>
        </div>

        {/*/!* Total Revenue (placeholder) *!/*/}
        {/*<div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3 border border-amber-200">*/}
        {/*  <div className="flex items-center gap-2 mb-1">*/}
        {/*    <span className="text-xs font-medium text-amber-700">Revenue</span>*/}
        {/*  </div>*/}
        {/*  <div className="text-lg font-bold text-amber-900">*/}
        {/*    ₱{(todaySessions.length * 45).toLocaleString()}*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>

      {/* Enhanced Filters Section */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <RegisterButton />
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Search customers..."
              value={
                (table.getColumn("customer")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("customer")?.setFilterValue(event.target.value)
              }
              className="w-full sm:w-64"
            />

            <Select
              value={
                (table.getColumn("branch")?.getFilterValue() as string) ||
                undefined
              }
              onValueChange={(value) =>
                table.getColumn("branch")?.setFilterValue(value)
              }
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="obrero">Obrero</SelectItem>
                <SelectItem value="matina">Matina</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
            {columnFilters.map((filter) => (
              <Badge key={filter.id} variant="secondary" className="text-xs">
                {filter.id}: {filter.value}
                <button
                  onClick={() => table.getColumn(filter.id)?.setFilterValue("")}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b bg-gray-50/50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="font-semibold text-gray-700"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-gray-500">Loading sessions...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
                    <Users className="h-8 w-8 text-gray-400" />
                    <span>No sessions found</span>
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="mt-2"
                      >
                        Clear filters to see all sessions
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Enhanced Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg border p-4">
        <div className="text-sm text-gray-600 order-2 sm:order-1">
          Showing {table.getRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} sessions
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <span className="ml-2 text-blue-600">
              ({table.getFilteredSelectedRowModel().rows.length} selected)
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 order-1 sm:order-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="transition-all hover:bg-gray-50"
          >
            Previous
          </Button>
          <div className="flex items-center gap-1 px-2">
            <span className="text-sm text-gray-600">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="transition-all hover:bg-gray-50"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

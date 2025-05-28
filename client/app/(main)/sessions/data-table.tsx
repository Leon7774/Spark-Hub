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
import {enrichSessions} from "@/app/(main)/sessions/enrich";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";


export const SessionsTable = () => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [data, setData] = useState<Session[]>([]);
  const { sessions: rawSessionData, loading, plans, customers } = useDataContext();

  useEffect(() => {
    setData(enrichSessions(rawSessionData, customers, plans));
    console.log(rawSessionData);
  }, [loading]);

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

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Total Sessions Today */}
        <div className="rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Badge variant="default">Total Today</Badge>
            <span className="text-2xl font-bold">
              {
                data.filter((s: Session) => {
                  const start = new Date(s.start_time);
                  const now = new Date();
                  return (
                    start.getDate() === now.getDate() &&
                    start.getMonth() === now.getMonth() &&
                    start.getFullYear() === now.getFullYear()
                  );
                }).length
              }
            </span>
          </div>
        </div>

        {/* Ongoing Sessions Today */}
        <div className="rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-green-100 text-green-800">
              Ongoing
            </Badge>
            <span className="text-2xl font-bold">
              {
                data.filter((s: Session) => {
                  const now = new Date();
                  const start = new Date(s.start_time);
                  const end = s.end_time ? new Date(s.end_time) : null;
                  const isToday =
                    start.getDate() === now.getDate() &&
                    start.getMonth() === now.getMonth() &&
                    start.getFullYear() === now.getFullYear();
                  return isToday && !end;
                }).length
              }
            </span>
          </div>
        </div>

        {/* Ended Sessions Today */}
        <div className="rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Ended</Badge>
            <span className="text-2xl font-bold">
              {
                data.filter((s: Session) => {
                  const end = s.end_time ? new Date(s.end_time) : null;
                  const now = new Date();
                  return (
                    end &&
                    end.getDate() === now.getDate() &&
                    end.getMonth() === now.getMonth() &&
                    end.getFullYear() === now.getFullYear()
                  );
                }).length
              }
            </span>
          </div>
        </div>

        {/* Branch Sessions - Combined in one card */}
        <div className="rounded-lg border p-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Branch Sessions</Badge>
            </div>
            <div className="flex justify-between">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Obrero</span>
                <span className="text-xl font-bold">
                  {
                    data.filter((s: Session) => {
                      const now = new Date();
                      const start = new Date(s.start_time);
                      const end = s.end_time ? new Date(s.end_time) : null;
                      const isToday =
                        start.getDate() === now.getDate() &&
                        start.getMonth() === now.getMonth() &&
                        start.getFullYear() === now.getFullYear();
                      return (
                        isToday &&
                        !end &&
                        s.branch?.includes("obrero")
                      );
                    }).length
                  }
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Matina</span>
                <span className="text-xl font-bold">
                  {
                    data.filter((s: Session) => {
                      const now = new Date();
                      const start = new Date(s.start_time);
                      const end = s.end_time ? new Date(s.end_time) : null;
                      const isToday =
                        start.getDate() === now.getDate() &&
                        start.getMonth() === now.getMonth() &&
                        start.getFullYear() === now.getFullYear();
                      return (
                        isToday &&
                        !end &&
                        s.branch?.includes("matina")
                      );
                    }).length
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between py-4">
        <RegisterButton />
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter by customer..."
            value={
              (table.getColumn("customer")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("customer")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          {/* TODO IMPLEMENT PLAN TYPE FILTER */}
          {/* <Input
            placeholder="Filter by type..."
            value={
              (table.getColumn("session_type")?.getFilterValue() as string) ??
              ""
            }
            onChange={(event) =>
              table
                .getColumn("session_type")
                ?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          /> */}
          <Select
              value={(table.getColumn("branch")?.getFilterValue() as string) || undefined}
              onValueChange={(value) => table.getColumn("branch")?.setFilterValue(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by location..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="obrero">Obrero</SelectItem>
              <SelectItem value="matina">Matina</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  No sessions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
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
};

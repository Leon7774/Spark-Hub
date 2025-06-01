"use client";

import React, { useState, useEffect } from "react";
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
  ColumnDef,
} from "@tanstack/react-table";
import {
  Calendar,
  Users,
  Clock,
  MapPin,
  X,
  Download,
  Filter,
  DollarSign,
  TrendingUp,
  CalendarDays,
  Timer,
  MoreHorizontal,
  Eye,
} from "lucide-react";

// Mock data structure based on your Session type
interface Session {
  id: number;
  customer: {
    first_name: string;
    last_name: string;
  };
  plan: {
    name: string;
    type: string;
    minutes?: number;
    day_passes?: number;
    price?: number;
  };
  start_time: string;
  end_time: string;
  branch: string;
  duration_minutes: number;
  revenue: number;
}

// Mock data generator
const generateMockSessions = (): Session[] => {
  const customers = [
    { first_name: "John", last_name: "Doe" },
    { first_name: "Jane", last_name: "Smith" },
    { first_name: "Mike", last_name: "Johnson" },
    { first_name: "Sarah", last_name: "Wilson" },
    { first_name: "David", last_name: "Brown" },
    { first_name: "Lisa", last_name: "Davis" },
  ];

  const plans = [
    { name: "1 Hour Gaming", type: "hourly", minutes: 60, price: 45 },
    { name: "2 Hour Gaming", type: "hourly", minutes: 120, price: 85 },
    { name: "Day Pass", type: "unlimited", day_passes: 1, price: 150 },
    { name: "Weekly Pass", type: "unlimited", day_passes: 7, price: 800 },
  ];

  const branches = ["Obrero", "Matina"];

  const sessions: Session[] = [];

  for (let i = 0; i < 50; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const plan = plans[Math.floor(Math.random() * plans.length)];
    const branch = branches[Math.floor(Math.random() * branches.length)];

    // Generate random date within last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - daysAgo);
    startTime.setHours(Math.floor(Math.random() * 12) + 8); // 8 AM to 8 PM
    startTime.setMinutes(Math.floor(Math.random() * 60));

    const duration = plan.minutes
      ? plan.minutes + Math.floor(Math.random() * 30) - 15
      : Math.floor(Math.random() * 300) + 60;
    const endTime = new Date(startTime.getTime() + duration * 60000);

    sessions.push({
      id: i + 1,
      customer,
      plan,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      branch: branch.toLowerCase(),
      duration_minutes: duration,
      revenue: plan.price || 45,
    });
  }

  return sessions.sort(
    (a, b) =>
      new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  );
};

// Columns definition for session log
const createColumns = (): ColumnDef<Session>[] => [
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.original.customer;
      return `${customer.first_name} ${customer.last_name}`;
    },
    filterFn: (row, columnId, filterValue) => {
      const customer = row.original.customer;
      const fullName =
        `${customer.first_name} ${customer.last_name}`.toLowerCase();
      return fullName.includes(filterValue.toLowerCase());
    },
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ row }) => {
      const plan = row.original.plan;
      return plan.name;
    },
  },
  {
    accessorKey: "start_time",
    header: "Start Time",
    cell: ({ row }) => {
      const date = new Date(row.original.start_time);
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    },
  },
  {
    accessorKey: "end_time",
    header: "End Time",
    cell: ({ row }) => {
      const date = new Date(row.original.end_time);
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => {
      const minutes = row.original.duration_minutes;
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    },
  },
  {
    accessorKey: "branch",
    header: "Branch",
    cell: ({ row }) => {
      const branch = row.original.branch.toLowerCase();
      let colorClass = "bg-gray-200";

      if (branch === "obrero") colorClass = "bg-purple-200 text-purple-800";
      else if (branch === "matina")
        colorClass = "bg-emerald-200 text-emerald-800";

      const displayName = branch.charAt(0).toUpperCase() + branch.slice(1);

      return (
        <div
          className={`${colorClass} font-bold text-center px-2 py-1 rounded-md text-sm`}
        >
          {displayName}
        </div>
      );
    },
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ row }) => {
      return `₱${row.original.revenue}`;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button className="p-1 hover:bg-gray-100 rounded">
          <Eye className="h-4 w-4 text-gray-600" />
        </button>
        <div className="relative">
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreHorizontal className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>
    ),
  },
];

export default function SessionLogPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState<Session[]>([]);
  const [dateFilter, setDateFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const columns = createColumns();

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setData(generateMockSessions());
      setIsLoading(false);
    }, 1000);
  }, []);

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
  const totalSessions = data.length;
  const totalRevenue = data.reduce((sum, session) => sum + session.revenue, 0);
  const averageSessionLength =
    data.length > 0
      ? Math.round(
          data.reduce((sum, session) => sum + session.duration_minutes, 0) /
            data.length
        )
      : 0;

  const todaySessions = data.filter((session) => {
    const sessionDate = new Date(session.start_time);
    const today = new Date();
    return sessionDate.toDateString() === today.toDateString();
  });

  const obreroSessions = data.filter(
    (session) => session.branch === "obrero"
  ).length;
  const matinaSessions = data.filter(
    (session) => session.branch === "matina"
  ).length;

  const clearFilters = () => {
    table.resetColumnFilters();
    setDateFilter("all");
  };

  const hasActiveFilters = columnFilters.length > 0 || dateFilter !== "all";

  const filterByDate = (days: number) => {
    if (days === 0) {
      setDateFilter("all");
      return;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // This would typically filter the data, but for demo purposes we'll just update the state
    setDateFilter(days.toString());
  };

  return (
    <div className="w-full space-y-6 min-h-screen">
      {/* Header */}
      <div className="bg-background rounded-lg border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Session Log</h1>
            <p className="text-primary">
              View and analyze completed gaming sessions
            </p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              Total Sessions
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {totalSessions}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Total Revenue
            </span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            ₱{totalRevenue.toLocaleString()}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">
              Avg Duration
            </span>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {Math.floor(averageSessionLength / 60)}h {averageSessionLength % 60}
            m
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Today</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {todaySessions.length}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Obrero</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {obreroSessions}
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Matina</span>
          </div>
          <div className="text-2xl font-bold text-emerald-900">
            {matinaSessions}
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-700">Filters</span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 ml-2"
              >
                <X className="h-4 w-4" />
                Clear All
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Date Filter Buttons */}
            <div className="flex gap-2">
              {[
                { label: "All", value: "all", days: 0 },
                { label: "Today", value: "1", days: 1 },
                { label: "7 Days", value: "7", days: 7 },
                { label: "30 Days", value: "30", days: 30 },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => filterByDate(filter.days)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    dateFilter === filter.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search customers..."
              value={
                (table.getColumn("customer")?.getFilterValue() as string) ?? ""
              }
              onChange={(e) =>
                table.getColumn("customer")?.setFilterValue(e.target.value)
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <select
              value={
                (table.getColumn("branch")?.getFilterValue() as string) || ""
              }
              onChange={(e) =>
                table.getColumn("branch")?.setFilterValue(e.target.value)
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Branches</option>
              <option value="obrero">Obrero</option>
              <option value="matina">Matina</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t">
            {columnFilters.map((filter) => (
              <div
                key={filter.id}
                className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
              >
                <span>
                  {filter.id}: {filter.value}
                </span>
                <button
                  onClick={() => table.getColumn(filter.id)?.setFilterValue("")}
                  className="hover:text-blue-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {dateFilter !== "all" && (
              <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">
                <span>Date: Last {dateFilter} days</span>
                <button
                  onClick={() => setDateFilter("all")}
                  className="hover:text-green-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b bg-gray-50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left font-semibold text-gray-700"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-gray-500">
                        Loading session logs...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
                      <Calendar className="h-8 w-8 text-gray-400" />
                      <span>No session logs found</span>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-blue-600 hover:text-blue-700 text-sm underline"
                        >
                          Clear filters to see all sessions
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {table.getRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} sessions
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

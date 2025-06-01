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
  AlertTriangle,
  RefreshCw,
  Timer,
  MoreHorizontal,
  Eye,
  UserX,
  Phone,
  Mail,
  Trash2,
} from "lucide-react";

// Subscription interface based on your schema
interface Subscription {
  id: number;
  created_at: string;
  customer_id: number;
  plan_id: number;
  expiry_date: string;
  days_left: number;
  last_login?: string;
  time_left: number;
  status: "active" | "expired" | "suspended" | "cancelled";
  // Enriched data
  customer?: {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
  };
  plan?: {
    name: string;
    type: string;
    price: number;
    duration_days?: number;
  };
}

// Mock data generator for expired subscriptions
const generateMockExpiredSubscriptions = (): Subscription[] => {
  const customers = [
    {
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@email.com",
      phone: "+63912345678",
    },
    {
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@email.com",
      phone: "+63923456789",
    },
    {
      first_name: "Mike",
      last_name: "Johnson",
      email: "mike.j@email.com",
      phone: "+63934567890",
    },
    {
      first_name: "Sarah",
      last_name: "Wilson",
      email: "sarah.w@email.com",
      phone: "+63945678901",
    },
    {
      first_name: "David",
      last_name: "Brown",
      email: "david.brown@email.com",
      phone: "+63956789012",
    },
    {
      first_name: "Lisa",
      last_name: "Davis",
      email: "lisa.davis@email.com",
      phone: "+63967890123",
    },
    {
      first_name: "Mark",
      last_name: "Garcia",
      email: "mark.garcia@email.com",
      phone: "+63978901234",
    },
    {
      first_name: "Emma",
      last_name: "Martinez",
      email: "emma.m@email.com",
      phone: "+63989012345",
    },
  ];

  const plans = [
    {
      name: "Weekly Gaming Pass",
      type: "unlimited",
      price: 800,
      duration_days: 7,
    },
    {
      name: "Monthly Gaming Pass",
      type: "unlimited",
      price: 2500,
      duration_days: 30,
    },
    { name: "Student Weekly", type: "limited", price: 600, duration_days: 7 },
    {
      name: "Premium Monthly",
      type: "unlimited",
      price: 3500,
      duration_days: 30,
    },
    { name: "Weekend Pass", type: "limited", price: 400, duration_days: 2 },
  ];

  const subscriptions: Subscription[] = [];

  for (let i = 0; i < 45; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const plan = plans[Math.floor(Math.random() * plans.length)];

    // Generate expired dates (1-90 days ago)
    const daysExpired = Math.floor(Math.random() * 90) + 1;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - daysExpired);

    // Creation date before expiry
    const createdDate = new Date(expiryDate);
    createdDate.setDate(createdDate.getDate() - (plan.duration_days || 30));

    // Last login - some random date between creation and expiry, some never logged in
    const lastLogin =
      Math.random() > 0.2
        ? (() => {
            const loginDate = new Date(
              createdDate.getTime() +
                Math.random() * (expiryDate.getTime() - createdDate.getTime())
            );
            return loginDate.toISOString();
          })()
        : undefined;

    subscriptions.push({
      id: i + 1,
      created_at: createdDate.toISOString(),
      customer_id: i + 100,
      plan_id: Math.floor(Math.random() * 5) + 1,
      expiry_date: expiryDate.toISOString(),
      days_left: -daysExpired, // Negative because expired
      last_login: lastLogin,
      time_left: 0, // Expired subscriptions have 0 time left
      status: "expired",
      customer: {
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        phone: customer.phone,
      },
      plan: plan,
    });
  }

  return subscriptions.sort(
    (a, b) =>
      new Date(b.expiry_date).getTime() - new Date(a.expiry_date).getTime()
  );
};

// Function to get days since expiry for display
const getDaysSinceExpiry = (expiryDate: string): number => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = today.getTime() - expiry.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Function to format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
};

// Columns definition for expired subscriptions
const createColumns = (): ColumnDef<Subscription>[] => [
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.original.customer;
      return customer
        ? `${customer.first_name} ${customer.last_name}`
        : "Unknown";
    },
    filterFn: (row, columnId, filterValue) => {
      const customer = row.original.customer;
      if (!customer) return false;
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
      return plan ? plan.name : "Unknown";
    },
  },
  {
    accessorKey: "expiry_date",
    header: "Expired On",
    cell: ({ row }) => {
      const date = new Date(row.original.expiry_date);
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "days_expired",
    header: "Days Expired",
    cell: ({ row }) => {
      const daysExpired = getDaysSinceExpiry(row.original.expiry_date);
      let colorClass = "bg-red-100 text-red-800";

      if (daysExpired > 30) colorClass = "bg-red-200 text-red-900";
      if (daysExpired > 60) colorClass = "bg-red-300 text-red-950";

      return (
        <div
          className={`${colorClass} px-2 py-1 rounded-md text-sm font-medium text-center`}
        >
          {daysExpired} days
        </div>
      );
    },
  },
  {
    accessorKey: "last_login",
    header: "Last Login",
    cell: ({ row }) => {
      const lastLogin = row.original.last_login;
      if (!lastLogin) {
        return (
          <span className="text-gray-400 italic text-sm">Never logged in</span>
        );
      }
      const date = new Date(lastLogin);
      return <span className="text-sm">{date.toLocaleDateString()}</span>;
    },
  },
  {
    accessorKey: "plan_value",
    header: "Plan Value",
    cell: ({ row }) => {
      const plan = row.original.plan;
      return plan ? `₱${plan.price}` : "₱0";
    },
  },
  {
    accessorKey: "contact",
    header: "Contact",
    cell: ({ row }) => {
      const customer = row.original.customer;
      if (!customer?.phone && !customer?.email) {
        return <span className="text-gray-400 text-sm">No contact info</span>;
      }

      return (
        <div className="flex items-center gap-2">
          {customer.phone && (
            <button
              className="p-1 hover:bg-gray-100 rounded"
              title={`Call ${customer.phone}`}
            >
              <Phone className="h-4 w-4 text-blue-600" />
            </button>
          )}
          {customer.email && (
            <button
              className="p-1 hover:bg-gray-100 rounded"
              title={`Email ${customer.email}`}
            >
              <Mail className="h-4 w-4 text-green-600" />
            </button>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <button className="p-1 hover:bg-gray-100 rounded" title="View Details">
          <Eye className="h-4 w-4 text-gray-600" />
        </button>
        <button
          className="p-1 hover:bg-green-100 rounded"
          title="Renew Subscription"
        >
          <RefreshCw className="h-4 w-4 text-green-600" />
        </button>
        <button
          className="p-1 hover:bg-red-100 rounded"
          title="Delete Subscription"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
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

export default function ExpiredSubscriptionsPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState<Subscription[]>([]);
  const [timeFilter, setTimeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const columns = createColumns();

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setData(generateMockExpiredSubscriptions());
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
  const totalExpired = data.length;
  const recentlyExpired = data.filter(
    (sub) => getDaysSinceExpiry(sub.expiry_date) <= 7
  ).length;
  const longExpired = data.filter(
    (sub) => getDaysSinceExpiry(sub.expiry_date) > 30
  ).length;
  const neverLoggedIn = data.filter((sub) => !sub.last_login).length;
  const totalValue = data.reduce((sum, sub) => sum + (sub.plan?.price || 0), 0);
  const averageDaysExpired =
    data.length > 0
      ? Math.round(
          data.reduce(
            (sum, sub) => sum + getDaysSinceExpiry(sub.expiry_date),
            0
          ) / data.length
        )
      : 0;

  const clearFilters = () => {
    table.resetColumnFilters();
    setTimeFilter("all");
  };

  const hasActiveFilters = columnFilters.length > 0 || timeFilter !== "all";

  const filterByExpiredTime = (days: string) => {
    setTimeFilter(days);
    // In a real implementation, you'd filter the data based on expiry time
  };

  return (
    <div className="w-full space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Expired Subscriptions
            </h1>
            <p className="text-gray-600">
              Manage and track expired customer subscriptions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <RefreshCw className="h-4 w-4" />
              Bulk Renewal
            </button>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-700">
              Total Expired
            </span>
          </div>
          <div className="text-2xl font-bold text-red-900">{totalExpired}</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">
              Recent (7d)
            </span>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {recentlyExpired}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">
              Long Expired
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {longExpired}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <UserX className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Never Used
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {neverLoggedIn}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Lost Value
            </span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            ₱{totalValue.toLocaleString()}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Avg Days</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {averageDaysExpired}
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
            {/* Time Filter Buttons */}
            <div className="flex gap-2">
              {[
                { label: "All", value: "all" },
                { label: "Last 7d", value: "7" },
                { label: "Last 30d", value: "30" },
                { label: "Over 60d", value: "60" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => filterByExpiredTime(filter.value)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    timeFilter === filter.value
                      ? "bg-red-600 text-white"
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
                (table.getColumn("plan")?.getFilterValue() as string) || ""
              }
              onChange={(e) =>
                table.getColumn("plan")?.setFilterValue(e.target.value)
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Plans</option>
              <option value="weekly">Weekly Pass</option>
              <option value="monthly">Monthly Pass</option>
              <option value="student">Student Pass</option>
              <option value="premium">Premium Pass</option>
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
            {timeFilter !== "all" && (
              <div className="flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm">
                <span>
                  Expired:{" "}
                  {timeFilter === "7"
                    ? "Last 7 days"
                    : timeFilter === "30"
                    ? "Last 30 days"
                    : "Over 60 days"}
                </span>
                <button
                  onClick={() => setTimeFilter("all")}
                  className="hover:text-red-900"
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
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                      <span className="text-gray-500">
                        Loading expired subscriptions...
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
                      <AlertTriangle className="h-8 w-8 text-gray-400" />
                      <span>No expired subscriptions found</span>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-blue-600 hover:text-blue-700 text-sm underline"
                        >
                          Clear filters to see all expired subscriptions
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
            {table.getFilteredRowModel().rows.length} expired subscriptions
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

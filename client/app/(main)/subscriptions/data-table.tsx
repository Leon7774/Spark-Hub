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
import {
  getCachedPlans,
  getCachedCustomers,
  shouldSyncData,
  syncDataFromSupabase,
} from "@/utils/cache/indexeddb";
import { format } from "date-fns";
import { toast } from "sonner";
import { DataTableProps } from "@/utils/types";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import RegisterButton from "@/app/(main)/subscriptions/register-button";
import { TableLoading } from "@/app/(main)/plans/loading";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function ActiveSubscriptions<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 15, // 👈 set your default rows per page here
  });

  const [rowSelection, setRowSelection] = React.useState({});

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
      pagination,
    },
    onPaginationChange: setPagination, // <-- Fix: sync pagination state
  });

  function exportToCSV(data: any[], columns: ColumnDef<any, any>[]) {
    // Extract headers properly
    const headers = columns.map((col) => {
      if (typeof col.header === "function") {
        try {
          // Try to get header text from function
          const headerResult = (col.header as Function)({});
          return typeof headerResult === "string"
            ? headerResult
            : col.accessorKey || "";
        } catch {
          return col.accessorKey || "";
        }
      }
      return typeof col.header === "string"
        ? col.header
        : col.accessorKey || "";
    });

    // Extract row data with proper handling of nested objects
    const rows = data.map((row) =>
      columns.map((col) => {
        const accessor = col.accessorKey as string;

        if (!accessor) return "";

        // Handle special cases based on accessor key
        if (accessor === "customer_name") {
          const customer = row.customer;
          return customer ? `${customer.first_name} ${customer.last_name}` : "";
        }

        if (accessor === "plan_name") {
          return row.plan?.name || row.plan_name || "";
        }

        // Handle date formatting
        if (accessor === "created_at" || accessor === "expiry_date") {
          const value = row[accessor];
          return value ? format(new Date(value), "PP") : "";
        }

        // Handle time_left formatting
        if (accessor === "time_left") {
          const value = row[accessor];
          return value != null
            ? `${Math.floor(value / 60)}h ${value % 60}m`
            : "";
        }

        // Handle days_left formatting
        if (accessor === "days_left") {
          const value = row[accessor];
          return value != null
            ? `${value} ${value === 1 ? "day" : "days"}`
            : "";
        }

        // Handle nested properties with dot notation
        const value = accessor.split(".").reduce((obj, key) => {
          return obj?.[key] ?? null;
        }, row);

        return value?.toString() ?? "";
      })
    );

    // Create CSV content
    let csvContent = "";
    csvContent += headers.join(",") + "\n";
    rows.forEach((row) => {
      // Escape commas and quotes in CSV data
      const escapedRow = row.map((cell) => {
        const cellStr = cell.toString();
        if (
          cellStr.includes(",") ||
          cellStr.includes('"') ||
          cellStr.includes("\n")
        ) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      });
      csvContent += escapedRow.join(",") + "\n";
    });

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "active_subscriptions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportToPDF<T>(data: T[], columns: ColumnDef<T, any>[]) {
    try {
      // Initialize PDF with landscape orientation
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
      });

      // Extract headers properly - simplified approach
      const headers = columns.map((col) => {
        if (typeof col.header === "function") {
          try {
            // Try to get header text from function
            const headerResult = (col.header as Function)({});
            return typeof headerResult === "string"
              ? headerResult
              : col.accessorKey || "";
          } catch {
            return col.accessorKey || "";
          }
        }
        return typeof col.header === "string"
          ? col.header
          : col.accessorKey || "";
      });

      // Format rows with proper text wrapping
      const rows = data.map((row) => {
        return columns.map((column) => {
          const accessorKey = (column as any).accessorKey as string;
          if (!accessorKey) return "";

          // Handle special cases based on accessor key
          if (accessorKey === "customer_name") {
            const customer = (row as any).customer;
            return customer
              ? `${customer.first_name} ${customer.last_name}`
              : "N/A";
          }

          if (accessorKey === "plan_name") {
            const plan = (row as any).plan;
            return plan?.name || (row as any).plan_name || "N/A";
          }

          // Handle nested properties
          const value = accessorKey.split(".").reduce((obj, key) => {
            return obj?.[key] ?? null;
          }, row as any);

          // Format content based on column type
          if (accessorKey === "created_at" || accessorKey === "expiry_date") {
            return value ? format(new Date(value), "PP") : "N/A";
          } else if (accessorKey === "time_left") {
            return value != null
              ? `${Math.floor(value / 60)}h ${value % 60}m`
              : "N/A";
          } else if (accessorKey === "days_left") {
            return value != null
              ? `${value} ${value === 1 ? "day" : "days"}`
              : "N/A";
          } else {
            return value?.toString() ?? "N/A";
          }
        });
      });

      // Add title
      doc.setFontSize(16);
      doc.text("Spark-Lab Active Subscriptions Report", 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${format(new Date(), "PPpp")}`, 14, 20);

      // Calculate dynamic column widths based on content
      const pageWidth = doc.internal.pageSize.width - 20; // Account for margins
      const columnCount = columns.length;
      const baseColumnWidth = pageWidth / columnCount;

      // Generate column styles with dynamic widths
      const columnStyles = {};
      columns.forEach((_, index) => {
        columnStyles[index] = {
          cellWidth: baseColumnWidth,
          minCellWidth: 15, // Minimum width for small columns
          maxCellWidth: 50, // Maximum width for large columns
        };
      });

      // Adjust specific columns if needed
      if (columnStyles[0])
        columnStyles[0] = { ...columnStyles[0], cellWidth: 15 }; // ID
      if (columnStyles[1])
        columnStyles[1] = { ...columnStyles[1], cellWidth: 30 }; // Customer
      if (columnStyles[2])
        columnStyles[2] = { ...columnStyles[2], cellWidth: 35 }; // Plan

      // Add table with optimized settings
      autoTable(doc, {
        startY: 25,
        head: [headers], // Use the properly extracted headers array
        body: rows,
        margin: { left: 10, right: 10 },
        tableWidth: "auto",
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: "linebreak",
          lineWidth: 0.1,
          lineColor: [200, 200, 200],
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 9,
          cellPadding: 4,
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles,
        didDrawPage: (data) => {
          // Footer
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(
            `Page ${data.pageNumber}`,
            doc.internal.pageSize.width - 20,
            doc.internal.pageSize.height - 10
          );
        },
        // Enable horizontal page breaks if needed
        horizontalPageBreak: true,
        // Ensure table fits within page width
        tableLineWidth: 0,
        showHead: "everyPage",
      });

      doc.save("active_subscriptions.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter by customer..."
            value={
              (table.getColumn("customer_name")?.getFilterValue() as string) ??
              ""
            }
            onChange={(event) =>
              table
                .getColumn("customer_name")
                ?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Input
            placeholder="Filter by plan..."
            value={
              (table.getColumn("plan_name")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("plan_name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(data, columns)}
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToPDF(data, columns)}
          >
            Export PDF
          </Button>
          <RegisterButton />
        </div>
      </div>
      <div className="rounded-md border">
        {data.length > 0 ? (
          <BaseTable<TData> table={table} padding={0} />
        ) : (
          <TableLoading></TableLoading>
        )}
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

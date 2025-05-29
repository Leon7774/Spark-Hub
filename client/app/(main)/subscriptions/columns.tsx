import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { subscriptionActiveSchema } from "@/lib/schemas";
import { z } from "zod";

// Common cell style for consistent alignment
const cellStyle = "p-2 text-sm";

export const columns: ColumnDef<z.infer<typeof subscriptionActiveSchema>>[] = [
  {
    accessorKey: "id",
    header: () => <div className="text-center pr-2">ID</div>,
    cell: ({ row }) => (
      <div className={`${cellStyle} text-center font-mono`}>
        {row.getValue("id")}
      </div>
    ),
    size: 10,
  },
  {
    accessorKey: "customer_name",
    header: () => <div className="text-left">Customer ID</div>,
    cell: ({ row }) => (
      <div className={`${cellStyle} text-left font-mono`}>
        {row.original.customer?.first_name}
        {row.original.customer?.last_name}
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "plan_name",
    header: () => <div className="text-left">Plan Name</div>,
    cell: ({ row }) => (
      <div className={`${cellStyle} text-left font-medium`}>
        {row.getValue("plan_name")}
      </div>
    ),
    size: 150,
  },
  {
    accessorKey: "created_at",
    header: () => <div className="text-left">Started</div>,
    cell: ({ row }) => {
      const date = row.getValue("created_at") as Date;
      return (
        <div className={`${cellStyle} text-left text-gray-600`}>
          {format(date, "PPp")}
        </div>
      );
    },
    size: 180,
  },
  {
    accessorKey: "expiry_date",
    header: () => <div className="text-left">Expires</div>,
    cell: ({ row }) => {
      const date = row.getValue("expiry_date") as Date;
      return (
        <div className={`${cellStyle} text-left font-medium text-red-600`}>
          {format(date, "PP")}
        </div>
      );
    },
    size: 150,
  },
  {
    accessorKey: "time_left",
    header: () => <div>Time Left</div>,
    cell: ({ row }) => {
      const value = row.getValue("time_left") as number | null;
      return (
        <div className={`${cellStyle}`}>
          {value != null ? (
            <span className="font-medium">
              {Math.floor(value / 60)}h {value % 60}m
            </span>
          ) : (
            <span className="text-gray-400">N/A</span>
          )}
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: "days_left",
    header: () => <div>Days Left</div>,
    cell: ({ row }) => {
      const value = row.getValue("days_left") as number | null;
      return (
        <div className={`${cellStyle}`}>
          {value != null ? (
            <Badge variant={value <= 3 ? "destructive" : "default"}>
              {value} {value === 1 ? "day" : "days"}
            </Badge>
          ) : (
            <span className="text-gray-400">N/A</span>
          )}
        </div>
      );
    },
    size: 120,
  },
];

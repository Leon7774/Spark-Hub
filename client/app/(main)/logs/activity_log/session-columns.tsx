import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export type Session = {
  id: string;
  customerName: string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // in minutes
  status: "completed" | "in_progress" | "cancelled";
  notes?: string;
};

export const sessionColumns: ColumnDef<Session>[] = [
  {
    accessorKey: "customerName",
    header: "Customer",
  },
  {
    accessorKey: "startTime",
    header: "Start Time",
    cell: ({ row }) => {
      const date = row.getValue("startTime") as Date;
      return format(date, "MMM d, yyyy h:mm a");
    },
  },
  {
    accessorKey: "endTime",
    header: "End Time",
    cell: ({ row }) => {
      const date = row.getValue("endTime") as Date | null;
      return date ? format(date, "MMM d, yyyy h:mm a") : "-";
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => {
      const duration = row.getValue("duration") as number;
      return `${duration} min`;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Session["status"];
      const statusMap = {
        completed: { label: "Completed", variant: "success" },
        in_progress: { label: "In Progress", variant: "warning" },
        cancelled: { label: "Cancelled", variant: "destructive" },
      };
      const { label, variant } = statusMap[status];
      return <Badge variant={variant as any}>{label}</Badge>;
    },
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => {
      const notes = row.getValue("notes") as string | undefined;
      return notes || "-";
    },
  },
];

import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PhilippinePeso } from "lucide-react";
import { getCustomerById, getPlanById } from "./functions";
import { useDataContext } from "@/context/dataContext";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";

export const data: Payment[] = [
  {
    id: "m5gr84i9",
    plan: "monthly plan",
    status: "in session",
    name: "john",
  },
  {
    id: "m5gr84i9",
    plan: "monthly plan",
    status: "in session",
    name: "john",
  },
  {
    id: "3u1reuv4",
    plan: "hourly",
    status: "in session",
    name: "mike",
  },
  {
    id: "derv1ws0",
    plan: "monthly plan",
    status: "offline",
    name: "leon",
  },
  {
    id: "5kma53ae",
    plan: "plan 350",
    status: "offline",
    name: "marcellin",
  },
  {
    id: "bhqecj4p",
    plan: "hourly",
    status: "in session",
    name: "carla",
  },
  {
    id: "m5gr84i9",
    plan: "monthly plan",
    status: "in session",
    name: "john",
  },
  {
    id: "m5gr84i9",
    plan: "monthly plan",
    status: "in session",
    name: "john",
  },
  {
    id: "3u1reuv4",
    plan: "hourly",
    status: "in session",
    name: "mike",
  },
  {
    id: "derv1ws0",
    plan: "monthly plan",
    status: "offline",
    name: "leon",
  },
  {
    id: "5kma53ae",
    plan: "plan 350",
    status: "offline",
    name: "marcellin",
  },
  {
    id: "bhqecj4p",
    plan: "hourly",
    status: "in session",
    name: "carla",
  },
  {
    id: "m5gr84i9",
    plan: "monthly plan",
    status: "in session",
    name: "john",
  },
  {
    id: "m5gr84i9",
    plan: "monthly plan",
    status: "in session",
    name: "john",
  },
];

export type Payment = {
  id: string;
  plan: "hourly" | "plan 350" | "monthly plan";
  status: "in session" | "offline";
  name: string;
};

interface Session {
  id: string;
  customer_id: number;
  session_type: string;
  plan_id: number | null;
  start_time: string;
  end_time: string | null;
  price: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  branch: "Obrero" | "Matina";
}

export const columns: ColumnDef<Session>[] = [
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const customer = getCustomerById(row.original.customer_id);
      return customer
        ? `${customer.first_name} ${customer.last_name}`
        : "Unknown";
    },
  },
  {
    accessorKey: "session_type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.session_type ?? "unknown";
      return (
        <Badge
          variant={
            type === "subscription"
              ? "default"
              : type === "straight"
              ? "secondary"
              : type === "hourly"
              ? "outline"
              : "destructive"
          }
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ row }) => {
      const plan = getPlanById(Number(row.original.id));
      return plan ? plan : "Custom";
    },
  },
  // {
  //   accessorKey: "start_time",
  //   header: "Start Time",
  //   cell: ({ row }) => {
  //     return format(new Date(row.original.start_time), "MMM d, h:mm a");
  //   },
  // },
  {
    accessorKey: "end_time",
    header: "End Time",
    cell: ({ row }) => {
      const endTime = row.original.end_time;
      return endTime ? new Date(endTime).toLocaleString() : "Ongoing";
    },
  },
  {
    accessorKey: "time_remaining",
    header: "Time Remaining",
    cell: ({ row }) => {
      const plan = row.original.plan;
      const startTime = new Date(row.original.start_time);
      const now = new Date();

      if (!plan?.duration_minutes) return "Unlimited";

      const elapsedMinutes = differenceInMinutes(now, startTime);
      const remainingMinutes = plan.duration_minutes - elapsedMinutes;

      if (remainingMinutes <= 0) return "Expired";

      const hours = Math.floor(remainingMinutes / 60);
      const minutes = remainingMinutes % 60;

      return `${hours}h ${minutes}m`;
    },
  },
  {
    accessorKey: "session_length",
    header: "Session Length",
    cell: ({ row }) => {
      const startTime = new Date(row.original.start_time);
      const now = new Date();
      const minutes = differenceInMinutes(now, startTime);

      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;

      return `${hours}h ${remainingMinutes}m`;
    },
  },
  {
    accessorKey: "branch",
    header: "Branch",
    cell: ({ row }) => {
      return row.original.branch;
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.original.price;
      return price ? (
        <div className="flex items-center gap-1">
          <PhilippinePeso className="h-4 w-4" />
          {price.toLocaleString()}
        </div>
      ) : (
        "N/A"
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status || "unknown";
      return (
        <Badge
          variant={
            status === "active"
              ? "default"
              : status === "completed"
              ? "secondary"
              : "destructive"
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      return new Date(row.original.created_at).toLocaleString();
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className="flex items-center justify-center outline-none focus-visible:ring-0"
          >
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

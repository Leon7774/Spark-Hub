import { MoreHorizontal } from "lucide-react";

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
import { Session } from "@/lib/schemas";
import { differenceInDays, differenceInMinutes, format } from "date-fns";

export const columns: ColumnDef<Session>[] = [
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.original.customer;
      return customer
        ? `${customer.first_name} ${customer.last_name}`
        : "Unknown";
    },
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ row }) => {
      const plan = row.original.plan;
      return plan ? plan.name : "Custom";
    },
  },
  {
    accessorKey: "start_time",
    header: "Start Time",
    cell: ({ row }) => {
      return format(new Date(row.original.start_time), "MMM d, h:mm a");
    },
  },

  {
    accessorKey: "time_left",
    header: "Usage Left",
    cell: ({ row }) => {
      const session = row.original;
      const startTime = new Date(session.start_time);
      const now = new Date();

      if (session.plan?.minutes) {
        const elapsedMinutes = differenceInMinutes(now, startTime);
        const remainingMinutes = session.plan?.minutes - elapsedMinutes;

        if (remainingMinutes <= 0) return "Expired";

        const hours = Math.floor(remainingMinutes / 60);
        const minutes = remainingMinutes % 60;

        return `${hours}h ${minutes}m`;
      }

      if (session.plan?.day_passes) {
        return `${session.subscription?.day_passes} day passes`;
      }

      if (session.plan?.expiry && session.subscription?.expiry_date) {
        const expiryDate = new Date(session.subscription.expiry_date);
        const daysRemaining = differenceInDays(expiryDate, now);

        if (daysRemaining < 0) return "Expired";
        return `Expires in ${daysRemaining} day${
          daysRemaining !== 1 ? "s" : ""
        }`;
      }
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
      const branch = row.original.branch.toLowerCase();

      let colorClass = "text-black";

      if (branch === "obrero") colorClass = "bg-red -300";
      else if (branch === "matina") colorClass = "bg-lime-300";

      // Capitalize first letter
      const displayName = branch.charAt(0).toUpperCase() + branch.slice(1);

      return <div className={colorClass + " font-bold text-center shadow-md rounded "}><span className={colorClass}>{displayName}</span></div>;
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
              onClick={() => navigator.clipboard.writeText(payment.id.toString())}
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

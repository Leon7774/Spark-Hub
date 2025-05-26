"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Clock, MapPin } from "lucide-react";
import { SubscriptionPlan } from "@/lib/schemas";

export const columns: ColumnDef<SubscriptionPlan>[] = [
  {
    accessorKey: "id",
    header: () => <div className="text-center pl-0.5 bg-gray-100">ID</div>,
    cell: ({ row }) => (
      <div className="text-center bg-gray-100 font-mono text-sm">
        {row.getValue("id")}
      </div>
    ),
    size: 60,
    minSize: 60,
  },
  {
    accessorKey: "name",
    header: "Plan Name",
    cell: ({ row }) => (
      <div className="font-semibold">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "plan_type",
    header: "Type",
    cell: ({ row }) => {
      const plan_type = row.getValue("plan_type") as string;
      const typeColors = {
        straight: "bg-blue-100 text-blue-800",
        bundle: "bg-purple-100 text-purple-800",
        hourly: "bg-green-100 text-green-800",
      };
      return (
        <Badge className={typeColors[plan_type as keyof typeof typeColors]}>
          {plan_type.charAt(0).toUpperCase() + plan_type.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      const plan_type = row.original.plan_type;
      const formatted = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(price);
      return (
        <div className="text-right">
          {formatted}
          {plan_type === "hourly" && (
            <span className="text-xs text-gray-500">/hr</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const is_active = row.getValue("is_active");
      return (
        <Badge variant={is_active ? "default" : "secondary"}>
          {is_active ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "time_valid_start",
    header: () => (
      <div className="flex items-center gap-1">
        <Clock className="h-4 w-4" />
        Valid Hours
      </div>
    ),
    cell: ({ row }) => {
      const start = row.getValue("time_valid_start") as string;
      const end = row.original.time_valid_end;
      return (
        <div className="text-sm font-mono">
          {start} - {end}
        </div>
      );
    },
  },
  {
    accessorKey: "time_included",
    header: "Duration",
    cell: ({ row }) => {
      const length = row.getValue("time_included") as number | undefined;
      const plan_type = row.original.plan_type;
      const daysIncluded = row.original.days_included;

      if (plan_type === "hourly") {
        return <span className="text-gray-400 text-sm">Per hour</span>;
      }

      if (length) {
        return <span className="text-sm">{length / 60} hours</span>;
      }

      if (daysIncluded) {
        return <span className="text-sm">{daysIncluded} days</span>;
      }

      return <span className="text-gray-400 text-sm">-</span>;
    },
  },
  {
    accessorKey: "available_at",
    header: () => (
      <div className="flex items-center gap-1">
        <MapPin className="h-4 w-4" />
        Locations
      </div>
    ),
    cell: ({ row }) => {
      const locations = row.getValue("available_at") as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {locations.map((location) => (
            <Badge key={location} variant="outline" className="text-xs">
              {location[0].toUpperCase() + location.slice(1)}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue("created_at") as Date;
      if (!date) return <div className="text-sm text-gray-600">-</div>;

      return (
        <div className="text-sm text-gray-600">
          {date.toLocaleString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 mr-4">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Edit plan</DropdownMenuItem>
              <DropdownMenuItem>Copy plan ID</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View subscribers</DropdownMenuItem>
              <DropdownMenuItem>View analytics</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                {row.original.is_active ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

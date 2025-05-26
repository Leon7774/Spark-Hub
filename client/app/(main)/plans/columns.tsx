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

// Type definition based on your schema
export type SubscriptionPlan = {
  id: number;
  name: string;
  active: boolean;
  price: number;
  type: "straight" | "bundle" | "hourly";
  length?: number;
  time_valid_start: string;
  time_valid_end: string;
  createdAt: Date;
  days_included?: number;
  expiry_duration?: number;
  available_at: ("Obrero" | "Matina")[];
};

// Sample data
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 1,
    name: "Basic Plan",
    active: true,
    price: 350,
    type: "straight",
    length: 30,
    time_valid_start: "08:00",
    time_valid_end: "22:00",
    createdAt: new Date("2024-01-15"),
    days_included: 30,
    expiry_duration: 2592000, // 30 days in seconds
    available_at: ["Obrero", "Matina"],
  },
  {
    id: 2,
    name: "Premium Bundle",
    active: true,
    price: 750,
    type: "bundle",
    length: 60,
    time_valid_start: "06:00",
    time_valid_end: "23:59",
    createdAt: new Date("2024-02-01"),
    days_included: 60,
    expiry_duration: 5184000, // 60 days in seconds
    available_at: ["Obrero"],
  },
  {
    id: 3,
    name: "Hourly Access",
    active: false,
    price: 25,
    type: "hourly",
    time_valid_start: "09:00",
    time_valid_end: "21:00",
    createdAt: new Date("2024-01-20"),
    available_at: ["Matina"],
  },
  {
    id: 4,
    name: "Weekly Special",
    active: true,
    price: 180,
    type: "straight",
    length: 7,
    time_valid_start: "07:00",
    time_valid_end: "22:30",
    createdAt: new Date("2024-02-10"),
    days_included: 7,
    expiry_duration: 604800, // 7 days in seconds
    available_at: ["Obrero", "Matina"],
  },
];

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
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const typeColors = {
        straight: "bg-blue-100 text-blue-800",
        bundle: "bg-purple-100 text-purple-800",
        hourly: "bg-green-100 text-green-800",
      };
      return (
        <Badge className={typeColors[type as keyof typeof typeColors]}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      const type = row.original.type;
      const formatted = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(price);
      return (
        <div className="text-right">
          {formatted}
          {type === "hourly" && (
            <span className="text-xs text-gray-500">/hr</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ row }) => {
      const active = row.getValue("active");
      return (
        <Badge variant={active ? "default" : "secondary"}>
          {active ? "Active" : "Inactive"}
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
    accessorKey: "length",
    header: "Duration",
    cell: ({ row }) => {
      const length = row.getValue("length") as number | undefined;
      const type = row.original.type;
      const daysIncluded = row.original.days_included;

      if (type === "hourly") {
        return <span className="text-gray-400 text-sm">Per hour</span>;
      }

      if (length) {
        return <span className="text-sm">{length} days</span>;
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
              {location}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return (
        <div className="text-sm text-gray-600">
          {date.toLocaleDateString("en-PH", {
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
                {row.original.active ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

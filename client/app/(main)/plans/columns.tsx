"use client";

import { ColumnDef } from "@tanstack/react-table";

export type Subscription = {
  id: number;
  name: string;
  price: number;
  active: boolean;
};

export const subscriptions: Subscription[] = [
  {
    id: 5,
    name: "Plan350",
    price: 350,
    active: true,
  },
  {
    id: 6,
    name: "Weekly Plan",
    price: 420,
    active: false,
  },
];

export const columns: ColumnDef<Subscription>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <div className="text-center font-mono text-xs">{row.getValue("id")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: "Plan Name",
    cell: ({ row }) => (
      <div className="font-semibold">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("price") as number; // 👈 tell TypeScript this is a number
      const formatted = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(price);

      return <div className="text-right">{formatted}</div>;
    },
  },

  {
    accessorKey: "active",
    header: "Active",
    cell: ({ row }) => {
      const active = row.getValue("active");
      return (
        <span
          className={
            active ? "text-green-600 font-bold" : "text-gray-400 italic"
          }
        >
          {active ? "Yes" : "No"}
        </span>
      );
    },
  },
];

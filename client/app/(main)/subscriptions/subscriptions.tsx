"use client";

import { ColumnDef } from "@tanstack/react-table";
import { boolean } from "zod";

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
    price: 500,
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
    size: 0,
    minSize: 0,
  },
  {
    accessorKey: "name",
    header: "Name",
    size: 0,
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "active",
    header: "Active",
  },
];

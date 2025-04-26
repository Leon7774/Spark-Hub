"use client";

import { Customer } from "@/utils/types";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "firstName",
    header: "lastName",
  },
  {
    accessorKey: "totalPaid",
    header: "totalDays",
  },
];

// Details of a customer

import { ColumnDef } from "@tanstack/react-table";

export const SubscriptionTypes = ["bundle", "straight", "hourly"] as [
  string,
  ...string[],
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Customer = {
  // Primary Key
  id: number;
  first_name: string;
  last_name: string;
  created_at: Date;
  total_spent: number;
  total_hours: number;
};

// Details of a subscription plan
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type SubscriptionPlan = {
  // Primary key
  id: number;
  // Name of the subscription plan
  name: string;
  // Status of the subscription plan, whether it is still being sold or not
  active: boolean;
  // Price to avail the subscription plan
  price: number;
  // Longevity of the subscription plan in days)
  length: number;
  //
  createdAt: Date;
  // Array of branches where the subscription plan is available at
  availableAt: string[];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type SubscriptionActive = [
  // Primary Key
  id: number,
  // Foregn key to customer id (owner of the subscription)
  customer_id: number,
  // Foreign key to subscription plan (to get details of subscription)
  plan_id: number,
  // The day the plan expires (current date + length from)
  expiry: Date,
  // The hours left for a plan
  timeLeft: number,
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Transaction = [
  // Primary Key
  id: number,
  // Foreign key to subscription plan
  plan_id: number,
  // Foreign key to customer id
  customer_id: number,
  total: number,
  date: Date,
  branch: string,
  staff: number,
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Log = [id: number, action: Action];

// TODO Add activity as program completes
export const Action = [
  "login",
  "logout",
  "create_customer",
  "session_start",
  "session_end",
  "plan_purchase",
  "",
] as const;

type Action = (typeof Action)[number];

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

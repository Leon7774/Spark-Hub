import { z } from "zod";

/* ───────────────────────────────
   Constants
─────────────────────────────── */
export const SubscriptionTypes = z.enum(["bundle", "straight", "hourly"]);
export type SubscriptionType = z.infer<typeof SubscriptionTypes>;

export const BranchEnum = z.enum(["Obrero", "Matina"]);
export type Branch = z.infer<typeof BranchEnum>;

export const ActionEnum = z.enum([
  "login",
  "logout",
  "create_customer",
  "session_start",
  "session_end",
  "plan_purchase",
  "",
]);
export type Action = z.infer<typeof ActionEnum>;

/* ───────────────────────────────
   Schemas
─────────────────────────────── */

export const customerSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  created_at: z.date(),
  total_spent: z.number(),
  total_hours: z.number(),
});

export const subscriptionPlanSchema = z.object({
  id: z.number(),
  name: z.string(),
  active: z.boolean(),
  price: z.number(),
  length: z.number(),
  createdAt: z.date(),
  availableAt: z.array(z.string()), // Or z.array(BranchEnum) if only Obrero/Matina
});

export const subscriptionActiveSchema = z.object({
  id: z.number(),
  customer_id: z.number(),
  plan_id: z.number(),
  expiry: z.date(),
  timeLeft: z.number(),
});

export const transactionSchema = z.object({
  id: z.number(),
  plan_id: z.number(),
  customer_id: z.number(),
  total: z.number(),
  date: z.date(),
  branch: BranchEnum,
  staff: z.number(),
});

export const logSchema = z.object({
  id: z.number(),
  action: ActionEnum,
});

export const sessionSchema = z.object({
  id: z.string(),
  customer_id: z.number(),
  plan_id: z.number().nullable(),
  start_time: z.string(), // or z.date() if it's ISO format already parsed
  end_time: z.string().nullable(), // or z.date().nullable()
  branch: BranchEnum,
  customer: z
    .object({
      first_name: z.string(),
      last_name: z.string(),
    })
    .optional(),
  plan: z
    .object({
      name: z.string(),
    })
    .optional(),
});

/* ───────────────────────────────
   Inferred Types
─────────────────────────────── */
export type Customer = z.infer<typeof customerSchema>;
export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;
export type SubscriptionActive = z.infer<typeof subscriptionActiveSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type Log = z.infer<typeof logSchema>;
export type Session = z.infer<typeof sessionSchema>;

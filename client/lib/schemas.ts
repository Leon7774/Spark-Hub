import { z } from "zod";

/* ───────────────────────────────
   Constants
─────────────────────────────── */
export const SubscriptionTypes = z.enum([
  "bundle",
  "straight",
  "hourly",
  "timed",
]);
export type SubscriptionType = z.infer<typeof SubscriptionTypes>;
export const BranchEnum = z.enum(["obrero", "matina"]);

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
  id: z.number().optional(),
  first_name: z.string(),
  last_name: z.string(),
  created_at: z.preprocess((val) => new Date(val as string), z.date()),
  total_spent: z.number(),
  total_hours: z.number(),
});

export const subscriptionPlanSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Plan name is required"),
  is_active: z.boolean().default(true),
  price: z.number(),
  plan_type: z.enum(["straight", "bundle", "hourly", "timed"]),
  time_included: z.number().nullable(),
  time_valid_start: z.preprocess(
    (val) => {
      // If the value is null or undefined, pass null directly.
      if (val === null || typeof val === "undefined" || val === "") {
        return null;
      }
      // Otherwise, ensure it's a string and slice it.
      return String(val).slice(0, 5);
    },
    z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Invalid time format, expected HH:mm",
      )
      .nullable(),
  ),
  time_valid_end: z.preprocess(
    (val) => {
      // If the value is null or undefined, pass null directly.
      if (val === null || typeof val === "undefined" || val === "") {
        return null;
      }
      // Otherwise, ensure it's a string and slice it.
      return String(val).slice(0, 5);
    },
    z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Invalid time format, expected HH:mm",
      )
      .nullable(),
  ),
  created_at: z
    .preprocess((val) => new Date(val as string), z.date())
    .nullable(),
  days_included: z.number().nullable(),
  expiry_duration: z.number().nullable(),
  available_at: z.array(BranchEnum), // Or z.array(BranchEnum) if only Obrero/Matina
});

export const subscriptionActiveSchema = z.object({
  id: z.number().optional(),
  created_at: z.preprocess((val) => new Date(val as string), z.date()), // or z.date() if it's ISO format already parsed
  customer_id: z.number(),
  plan_id: z.number(),
  plan_name: z.string().optional(),
  expiry_date: z
    .preprocess((val) => new Date(val as string), z.date())
    .nullable(), // or z.date() if it's ISO format already parsed
  time_left: z.number().nullable().optional(),
  days_left: z.number().nullable().optional(),
  customer: z
    .object({
      id: z.number(),
      first_name: z.string(),
      last_name: z.string(),
    })
    .optional(),
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
  id: z.number(),
  customer_id: z.number(),
  plan_id: z.number(),
  start_time: z.preprocess((val) => new Date(val as string), z.date()), // or z.date() if it's ISO format already parsed
  end_time: z.preprocess((val) => new Date(val as string), z.date()).nullable(),
  time_left: z.number().nullable(),
  branch: z.enum(BranchEnum.options), // Or z.array(BranchEnum) if only Obrero/Matina(),
  customer: z
    .object({
      first_name: z.string(),
      last_name: z.string(),
    })
    .nullable()
    .optional(),
  plan: z
    .object({
      name: z.string(),
      minutes: z.number().optional().nullable(),
      day_passes: z.number().optional().nullable(),
      expiry: z
        .preprocess((val) => new Date(val as string), z.date())
        .optional()
        .nullable(),
      price: z.number(),
      type: z.string(),
    })
    .optional()
    .nullable(),
  plan_type: z.enum(SubscriptionTypes.options).optional().nullable(),
  subscription: z
    .object({
      time_left: z.number().optional(),
      day_passes: z.number().optional(),
      expiry_date: z.preprocess((val) => new Date(val as string), z.date()), // or z.date() if it's ISO format already parsed
    })
    .optional()
    .nullable(),
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

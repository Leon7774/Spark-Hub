import { createClient } from "@/utils/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";
import { number, string, z } from "zod";

export const PlanSchema = z.object({
  id: z.number(),
  created_at: z.string().transform((val) => new Date(val)),
  is_active: z.boolean(),
  time_valid_start: z.string(),
  time_valid_end: z.string(),
  time_included: z.number(),
  days_included: z.number(),
  expiry_duration: z.number(),
  plan_type: z.string(),
});

export enum PlanType {
  HOURLY = "hourly",
  STRAIGHT = "straight",
  BUNDLE = "bundle",
}

export type Customer = z.infer<typeof PlanSchema>; // <-- THIS gives you the TS type

export async function getCustomers(): Promise<Customer[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("subscription_plans").select("*");

  if (error || !data) throw error;

  const customers = PlanSchema.array().parse(data); // <- validate with Zod!

  return customers;
}

export async function registerCustomer(
  plan_name: string,
  price: number,
  plan_type: PlanType,
  time_included: number | null,
  days_included: number | null,
  expiry_duration: number | null,
  time_valid_start: string | null,
  time_valid_end: string | null
): Promise<PostgrestError | null> {
  const supabase = await createClient();

  console.log("Attempting to insert " + plan_name + " into subscription_plans");

  const { error } = await supabase
    .from("subscription_plans")
    .insert([
      {
        name: plan_name,
        price: price,
        plan_type: plan_type,
        time_included: time_included,
        days_included: days_included,
        expiry_duration: expiry_duration,
        time_valid_start: time_valid_start,
        time_valid_end: time_valid_end,
      },
    ])
    .select();

  if (error) {
    console.log(error);
  }

  return error;
}

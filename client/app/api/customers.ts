import { createClient } from "@/utils/supabase/client";
import { z } from "zod";

const CustomerSchema = z.object({
  id: z.number(),
  created_at: z.string().transform((val) => new Date(val)),
  first_name: z.string(),
  last_name: z.string(),
  total_spent: z.number(),
  total_hours: z.number(), // <- fixed typo
});

export type Customer = z.infer<typeof CustomerSchema>; // <-- THIS gives you the TS type

export async function getCustomers(): Promise<Customer[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("customers").select("*");

  if (error || !data) throw error;

  const customers = CustomerSchema.array().parse(data); // <- validate with Zod!

  return customers;
}

export async function registerCustomer(first_name: string, last_name: string) {
  const supabase = await createClient();

  console.log("Attempting to insert " + first_name);

  const { error } = await supabase
    .from("customers")
    .insert([{ first_name: first_name, last_name: last_name }])
    .select();

  if (error) {
    console.log(error);
  }
}

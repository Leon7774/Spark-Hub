import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

const CustomerSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  created_at: z.string().transform(val => new Date(val)),
  first_name: z.string(),
  last_name: z.string(),
  total_spent: z.number(),
  total_hours: z.number() // <- fixed typo
});

type Customer = z.infer<typeof CustomerSchema>; // <-- THIS gives you the TS type

export async function getCustomers(): Promise<Customer[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("customers").select("*");
  
  if (error || !data) throw error;

  const customers = CustomerSchema.array().parse(data); // <- validate with Zod!

  return customers;
}

console.log(getCustomers());


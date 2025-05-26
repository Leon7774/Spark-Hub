import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { subscriptionPlanSchema, SubscriptionTypes } from "@/lib/schemas";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("subscription_plans").select("*");
  if (error || !data) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  console.log(data);
  console.log(SubscriptionTypes.safeParse(data[0]).error);

  const parseResult = data.map((data) => {
    return SubscriptionTypes.safeParse(data);
  });

  return NextResponse.json(parseResult); // data is the customer object now
}

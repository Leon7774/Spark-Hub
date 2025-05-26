import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { subscriptionPlanSchema } from "@/lib/schemas";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("subscription_plans").select("*");
  if (error || !data) {
    return NextResponse.json({ error: "Plans not found" }, { status: 404 });
  }

  // Transform and validate the data
  const validatedPlans = data
    .map((plan) => {
      try {
        return subscriptionPlanSchema.parse({
          ...plan,
          created_at: plan.created_at ? new Date(plan.created_at) : null,
        });
      } catch (error) {
        console.error("Invalid plan data:", error);
        return null;
      }
    })
    .filter(Boolean);

  return NextResponse.json(validatedPlans);
}

export async function GET(request: NextRequest, { params }) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("subscription_plans").select("*");

  return NextResponse.json(validatedPlans);
}

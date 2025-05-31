import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { subscriptionPlanSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const planType = request.nextUrl.searchParams.get("plan_type");

  // If no type or planType is provided, fetch all plans
  if (!planType) {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*");

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
    // If type or planType is provided, fetch plans based on type and planType
  } else {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("plan_type", planType);

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
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  console.log("Trying to register plan");

  try {
    // Parse the incoming JSON body
    const body = await request.json();

    // Validate the input using Zod schema
    const validated = subscriptionPlanSchema.parse(body);

    // console.activity_log("Validated data:", validated);

    // Insert the validated plan into the database
    const { data, error } = await supabase
      .from("subscription_plans")
      .insert([validated])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to create plan" },
        { status: 500 },
      );
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (err: any) {
    console.error("Validation or insert error:", err);
    return NextResponse.json(
      { error: err.message || "Invalid input" },
      { status: 400 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

// Define the schema for subscriptions based on your table structure
const subscriptionSchema = z.object({
  id: z.number(),
  created_at: z.string(),
  customer_id: z.number(),
  plan_id: z.number(),
  expiry_date: z.string(),
  days_left: z.number(),
  last_login: z.string(),
  time_left: z.number(),
  status: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const { data, error, count } = await supabase
      .from("subscriptions")
      .select("*");
    //
    // // Get pagination parameters
    // const page = parseInt(searchParams.get("page") || "1");
    // const limit = parseInt(searchParams.get("limit") || "10");
    // const offset = (page - 1) * limit;
    //
    // // Get filters
    // const status = searchParams.get("status");
    // const customerId = searchParams.get("customerId");
    //
    // let query = supabase
    //   .from("subscriptions")
    //   .select(
    //     `
    //     id,
    //     created_at,
    //     customer_id,
    //     plan_id,
    //     expiry_date,
    //     days_left,
    //     last_login,
    //     time_left,
    //     status,
    //     customers (
    //       first_name,
    //       last_name
    //     ),
    //     subscription_plans (
    //       name,
    //       plan_type
    //     )
    //   `,
    //     { count: "exact" },
    //   )
    //   .order("created_at", { ascending: false })
    //   .range(offset, offset + limit - 1);
    //
    // // Apply filters if provided
    // if (status) {
    //   query = query.eq("status", status);
    // }
    // if (customerId) {
    //   query = query.eq("customer_id", customerId);
    // }

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch subscriptions" },
        { status: 500 },
      );
    }

    // // Transform the data to include customer and plan information
    // const transformedData = data?.map((subscription) => ({
    //   ...subscription,
    //   customer_name: subscription.customers
    //     ? `${subscription.customers.first_name} ${subscription.customers.last_name}`
    //     : "Unknown",
    //   plan_name: subscription.subscription_plans?.name || "Unknown",
    //   plan_type: subscription.subscription_plans?.plan_type || "Unknown",
    // }));

    // return NextResponse.json({
    //   data: data,
    //   pagination: {
    //     page,
    //     limit,
    //     total: count || 0,
    //   },
    // });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    console.log("Plan ID: " + body.plan_id);

    // Validate request body
    const validatedData = subscriptionSchema.partial().parse(body);

    // Insert subscription
    const { data, error } = await supabase
      .from("subscriptions")
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create subscription" },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// TODO: Finish this
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient();
  const id = await params.id;

  console.log(id);
}

// ADD A SUBSCRIPTION FUNCTION
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    console.log(body);

    const { customer_id, plan_id } = body;

    // Validate required fields
    if (!customer_id || !plan_id) {
      return NextResponse.json(
        { error: "Customer ID and Plan ID are required" },
        { status: 400 },
      );
    }

    // Get the plan details to ensure it's a bundle plan
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", plan_id)
      .eq("plan_type", "bundle")
      .eq("is_active", true)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: "Plan not found or not a valid bundle plan" },
        { status: 404 },
      );
    }

    // Get customer details
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customer_id)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    // Calculate expiry date based on plan
    let expiryDate = null;
    if (plan.expiry_duration) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + plan.expiry_duration);
      expiryDate = expiry.toISOString();
    }

    // Create active subscription
    const subscriptionData = {
      customer_id: customer_id,
      plan_id: plan_id,
      expiry_date: expiryDate,
      time_left: plan.time_included,
      days_left: plan.days_included,
      created_at: new Date().toISOString(),
    };

    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscription_active")
      .insert(subscriptionData)
      .select()
      .single();

    if (subscriptionError) {
      console.error("Subscription creation error:", subscriptionError);
      return NextResponse.json(
        { error: "Failed to create subscription" },
        { status: 500 },
      );
    }

    // Update customer's total spent
    const { error: customerUpdateError } = await supabase
      .from("customers")
      .update({
        total_spent: (customer.total_spent || 0) + plan.price,
      })
      .eq("id", customer_id);

    if (customerUpdateError) {
      console.error("Customer update error:", customerUpdateError);
      // Note: We don't return error here as subscription was created successfully
    }

    // TODO: Add logging if needed
    // const { error: logError } = await supabase
    //   .from("logs")
    //   .insert({
    //     action: "plan_purchase",
    //     customer_id: customer_id,
    //     plan_id: plan_id,
    //     created_at: new Date().toISOString(),
    //   });

    return NextResponse.json({
      success: true,
      subscription: subscription,
      message: `Successfully subscribed to ${plan.name}`,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

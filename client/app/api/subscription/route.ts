import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { validateData, validateSingleData } from "@/app/api/validator";
import { subscriptionActiveSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  console.log("Fetching all subscriptions");
  const { data, error } = await supabase
    .from("active_subscriptions")
    .select("*");

  if (error || !data) {
    console.error(error);
    return NextResponse.json(
      { error: "Subscriptions not found" },
      { status: 404 },
    );
  }

  const validatedData = validateData(data, subscriptionActiveSchema);

  console.log(validatedData);

  return NextResponse.json(validatedData);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  console.log("Trying to create subscription");

  try {
    console.log(request);
    const body = await request.json();
    const validatedData = validateSingleData(body, subscriptionActiveSchema);

    if (validatedData === null) {
      return NextResponse.json(
        { error: "Invalid subscription data" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("active_subscriptions")
      .insert(validatedData)
      .select();

    console.log(data);

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to create subscription" },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 },
    );
  }
}

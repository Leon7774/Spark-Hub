import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { validateData } from "@/app/api/validator";
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

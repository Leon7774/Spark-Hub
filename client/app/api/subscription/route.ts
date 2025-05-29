import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("subscriptions").select("*");

  // If the request body has an id parameter, find the specific subscription
  if (request.nextUrl.searchParams.get("id")) {
    const id = request.nextUrl.searchParams.get("id");
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(data);
  }

  if (error || !data) {
    return NextResponse.json(
      { error: "Subscriptions not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(data);
}

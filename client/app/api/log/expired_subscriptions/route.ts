import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    // Get pagination parameters with defaults
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Current date for comparison
    const currentDate = new Date().toISOString();

    // Query expired subscriptions
    const { data, error, count } = await supabase
      .from("active_subscriptions")
      .select("*, customer:customers(first_name, last_name)", {
        count: "exact",
      })
      .or(`expiry_date.lt.${currentDate},and(time_left.eq.0)`)
      .order("expiry_date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch expired subscriptions" },
        { status: 500 },
      );
    }

    // Return paginated results
    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching expired subscriptions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

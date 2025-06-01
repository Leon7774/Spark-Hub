import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

// Schema for validating action log entries
const actionLogSchema = z.object({
  action_type: z.string(),
  description: z.string(),
  metadata: z.record(z.any()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    // Get pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Get filters
    const userId = searchParams.get("userId");
    const actionType = searchParams.get("actionType");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    let query = supabase
      .from("activity_log")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters if provided
    if (userId) {
      query = query.eq("user_id", userId);
    }
    if (actionType) {
      query = query.eq("action_type", actionType);
    }
    if (fromDate) {
      query = query.gte("created_at", fromDate);
    }
    if (toDate) {
      query = query.lte("created_at", toDate);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch action logs" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count,
      },
    });
  } catch (error) {
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

    // Validate request body
    const validatedData = actionLogSchema.parse(body);

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Insert action log
    const { data, error } = await supabase
      .from("action_logs")
      .insert({
        user_id: user.id,
        action_type: validatedData.action_type,
        description: validatedData.description,
        metadata: validatedData.metadata || {},
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create action log" },
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

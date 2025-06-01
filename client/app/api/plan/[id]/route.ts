import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id } = params;

  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  return NextResponse.json(data); // data is the customer object now
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id } = await params;
  const body = await request.json();

  // Handle is_active update
  if (typeof body.is_active === "boolean") {
    const { error } = await supabase
      .from("subscription_plans")
      .update({ is_active: body.is_active })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, action: "is_active updated" });
  }

  // Handle deletion only if 'delete' is true
  if (body.delete === true) {
    const { data, error: fetchError } = await supabase
      .from("subscription_plans")
      .select("is_active")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    if (data.is_active) {
      return NextResponse.json(
        { error: "Cannot delete an active plan." },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase
      .from("subscription_plans")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, action: "plan deleted" });
  }

  return NextResponse.json(
    { error: "No valid action specified in body." },
    { status: 400 }
  );
}

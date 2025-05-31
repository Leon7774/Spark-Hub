import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Logout the session
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient();

  const { id } = await params;

  const { data, error } = await supabase
    .from("sessions")
    .update({ end_time: new Date(Date.now()) })
    .eq("id", id)
    .select();

  console.log(data);

  if (error || data === null) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

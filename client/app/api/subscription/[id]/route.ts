import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient();

  const body = await request.json();
  const id = await params.id;

  const length = body.length;

  // GET THE SESSION LENGTH

  if (id) {
    const { data, error } = await supabase
      .from("subscriptions")
      .update({ time: "otherValue" })
      .eq("some_column", "someValue")
      .select();

    if (error || !data) {
      //TODO: Validate data
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } else {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
}

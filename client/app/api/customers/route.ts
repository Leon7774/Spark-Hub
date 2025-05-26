import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("customers").select("*");

  if (error || !data) {
    return NextResponse.json({ error: "Customers not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

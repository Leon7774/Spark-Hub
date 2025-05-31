import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Logout the session
export async function POST(request: NextRequest, { params }: { params: any }) {
  const supabase = await createClient();

  c;

  return NextResponse.json(data);
}

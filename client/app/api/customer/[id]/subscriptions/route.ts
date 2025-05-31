import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// TODO: Finish this
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient();
  const id = await params.id;

  console.log(id);
}

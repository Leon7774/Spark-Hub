import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { customerSchema } from "@/lib/schemas";
import { validateData } from "@/app/api/validator";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { data, error } = await supabase.from("customers").select("*");

  if (error || !data) {
    // console.log(error);
    return NextResponse.json({ error: "Customers not found" }, { status: 404 });
  }

  validateData(data, customerSchema);

  return NextResponse.json(data);
}

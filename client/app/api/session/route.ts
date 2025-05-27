import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { sessionSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Join with customers, plans, and subscriptions tables
  const { data, error } = await supabase.from("sessions").select("*");

  console.log(data);

  if (error || !data) {
    return NextResponse.json({ error: "Sessions not found" }, { status: 404 });
  }

  const validatedSessions = data
    .map((session) => {
      try {
        return sessionSchema.parse({
          ...session,
        });
      } catch (error) {
        console.error("Invalid session data:", error);
        return null;
      }
    })
    .filter(Boolean);

  return NextResponse.json(validatedSessions);
}

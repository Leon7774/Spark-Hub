import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { sessionSchema, Session } from "@/lib/schemas";
import { validateData } from "@/app/api/validator";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  if (request.nextUrl.searchParams.get("id")) {
    const id = request.nextUrl.searchParams.get("id");
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) {
      validateSession(data);

      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } else {
    console.log("Fetching all sessions");
    const { data, error } = await supabase.from("sessions").select("*");
    if (error || !data) {
      return NextResponse.json(
        { error: "Sessions not found" },
        { status: 404 },
      );
    }
    // validateData(data, sessionSchema);
    validateSession(data);
    // console.log("Trying to log");
    return NextResponse.json(data);
  }
}

function validateSession(session: Session[]) {
  return session.map((session) => {
    try {
      sessionSchema.parse(session);
    } catch (error) {
      // console.error("Invalid session data:", error);
      return null;
    }
  });
}

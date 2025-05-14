import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const supabase = createRouteHandlerClient({ cookies });

    // Extract form data
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const adminKey = formData.get("admin_key") as string;
    const firstName = formData.get("first_name") as string;
    const lastName = formData.get("last_name") as string;
    const contactNumber = formData.get("contact_number") as string;
    const role = formData.get("role") as string;

    // Verify admin key
    const { data: keyCheck, error: keyError } = await supabase
      .from("admin_keys")
      .select("is_valid")
      .eq("key", adminKey)
      .single();

    if (keyError || !keyCheck?.is_valid) {
      return NextResponse.json(
        { message: "Invalid admin key" },
        { status: 401 }
      );
    }

    // Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role,
        },
      },
    });

    if (authError) {
      return NextResponse.json({ message: authError.message }, { status: 400 });
    }

    // Add staff details to staff table
    const { error: staffError } = await supabase.from("staff").insert({
      user_id: authData.user?.id,
      first_name: firstName,
      last_name: lastName,
      contact_number: contactNumber,
      email,
    });

    if (staffError) {
      return NextResponse.json(
        { message: staffError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Staff registered successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

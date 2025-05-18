"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { userCredentials } from "../login/login-form";
import { logServerAction } from "@/utils/logger";

export async function login(formData: userCredentials): Promise<boolean> {
  const supabase = await createClient();
  console.log(supabase);

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.email as string,
    password: formData.password as string,
  };

  console.log("Verifying: " + JSON.stringify(data));

  const { error, data: authData } = await supabase.auth.signInWithPassword(
    data
  );

  if (error) {
    console.log("Oops, something went wrong!");
    return false;
  }

  // Log successful login
  if (authData.user) {
    await logServerAction(
      {
        action_type: "login",
        description: `User logged in: ${data.email}`,
        metadata: {
          email: data.email,
          timestamp: new Date().toISOString(),
        },
      },
      authData.user.id
    );
  }

  revalidatePath("/", "layout");
  redirect("/sessions");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error, data: authData } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  }

  // Log successful registration
  if (authData.user) {
    await logServerAction(
      {
        action_type: "register",
        description: `New user registered: ${data.email}`,
        metadata: {
          email: data.email,
          timestamp: new Date().toISOString(),
        },
      },
      authData.user.id
    );
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();

  // Get user before logging out
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.log(error);
  } else if (user) {
    // Log successful logout
    await logServerAction(
      {
        action_type: "logout",
        description: `User logged out: ${user.email}`,
        metadata: {
          email: user.email,
          timestamp: new Date().toISOString(),
        },
      },
      user.id
    );
  }

  redirect("/");
}

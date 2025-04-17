"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { formSchema, userCredentials } from "./login-form";

export async function login(formData: userCredentials) {
  const supabase = await createClient();
  console.log(supabase);

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.email as string,
    password: formData.password as string,
  };

  console.log("Verifying: " + JSON.stringify(data));

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.log("Oops, something went wrong!");
    redirect("/error");
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

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");

  redirect("/");
}

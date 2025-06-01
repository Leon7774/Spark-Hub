"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Sparkle } from "lucide-react";
import { useState, useEffect } from "react";

// Schema for admin key verification
const adminKeySchema = z.object({
  adminKey: z.string().min(1, {
    message: "Admin key is required",
  }),
});

// Schema for registration
const registerFormSchema = z
  .object({
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const router = useRouter();
  const [adminKeyVerified, setAdminKeyVerified] = useState(false);
  const [correctAdminKey, setCorrectAdminKey] = useState("");
  const [loading, setLoading] = useState(true);

  // Form for admin key verification
  const adminKeyForm = useForm<z.infer<typeof adminKeySchema>>({
    resolver: zodResolver(adminKeySchema),
    defaultValues: {
      adminKey: "",
    },
  });

  // Form for registration
  const registerForm = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const fetchAdminKey = async () => {
      try {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from("keys")
          .select("value")
          .single();

        if (error) throw error;
        if (data) setCorrectAdminKey(data.value);
      } catch (error) {
        console.error("Error fetching admin key:", error);
        toast.error("Failed to verify admin key configuration");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminKey();
  }, []);

  const verifyAdminKey = async (values: z.infer<typeof adminKeySchema>) => {
    if (values.adminKey === correctAdminKey) {
      setAdminKeyVerified(true);
      toast.success("Admin key verified");
      adminKeyForm.reset(); // Clear the admin key form after verification
    } else {
      toast.error("Invalid admin key");
      adminKeyForm.setValue("adminKey", ""); // Clear the input on wrong key
    }
  };

  async function handleRegister(values: z.infer<typeof registerFormSchema>) {
    try {
      const supabase = await createClient();

      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast.success(
        "Registration successful! Please check your email to verify your account."
      );
      router.push("/login");
    } catch (error) {
      console.error("Error registering:", error);
      toast.error("Failed to register. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-400"></div>
      </div>
    );
  }

  return (
    <div className="h-full pb-20 flex items-center justify-center flex-col bg-background-2">
      <div className="flex items-center justify-center flex-col p-10 rounded-4xl bg-background shadow-lg">
        <div className="w-80">
          <div className="flex gap-2 pb-4 pl-4 border-b border-gray-300 mb-10">
            <div className="flex items-center pb-2">
              <Sparkle size={38} color="#ff9f19" fill="#ff9f19" />
            </div>
            <div className="flex flex-col gap-10">
              <span className="h-0 text-4xl font-black">Spark-Hub</span>
              <span className="m-0 h-4 mt-1 text-xs">
                Administration System
              </span>
            </div>
          </div>
          <h1 className="font-bold text-3xl pb-4">Register</h1>
        </div>

        <div className="w-80">
          {!adminKeyVerified ? (
            <Form {...adminKeyForm}>
              <form
                onSubmit={adminKeyForm.handleSubmit(verifyAdminKey)}
                className="space-y-4"
              >
                <FormField
                  control={adminKeyForm.control}
                  name="adminKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Key</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                          value={field.value || ""} // Ensure empty string if undefined
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-orange-400">
                  Verify Admin Key
                </Button>
              </form>
            </Form>
          ) : (
            <>
              <Form {...registerForm}>
                <form
                  onSubmit={registerForm.handleSubmit(handleRegister)}
                  className="space-y-4"
                >
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="name@example.com"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-orange-400">
                    Register
                  </Button>
                </form>
              </Form>

              <p className="mt-10 text-center text-sm w-60 mb-2 text-primary/40">
                Already have an account?
              </p>
              <Link href="/login">
                <Button className="bg-orange-400">Login</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

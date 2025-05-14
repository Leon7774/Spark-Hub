"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

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
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const staffFormSchema = z.object({
  admin_key: z.string().min(1, "Admin key is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  contact_number: z.string().min(1, "Contact number is required"),
});

export default function RegisterStaffForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof staffFormSchema>>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      contact_number: "",
      admin_key: "",
    },
  });

  async function onSubmit(values: z.infer<typeof staffFormSchema>) {
    try {
      setIsLoading(true);
      setShowError(false);
      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("admin_key", values.admin_key);
      formData.append("first_name", values.first_name);
      formData.append("last_name", values.last_name);
      formData.append("contact_number", values.contact_number);
      formData.append("role", "staff");

      const response = await fetch("/api/register", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to register staff");
      }

      toast.success("Staff registration successful");
      router.push("/login");
    } catch (error: any) {
      setShowError(true);
      toast.error(error.message || "Failed to register staff");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="contact_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter contact number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="admin_key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin Key</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter admin key"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div
          className={
            showError
              ? "block w-full justify-center text-center"
              : "hidden w-full justify-center text-center"
          }
        >
          <span className="text-red-500">
            Registration failed. Please try again.
          </span>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </Button>
          <Button
            type="reset"
            variant={"outline"}
            disabled={isLoading}
            onClick={() => {
              form.reset();
              setShowError(false);
            }}
          >
            Clear
          </Button>
        </div>
      </form>
    </Form>
  );
}

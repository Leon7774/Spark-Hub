"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { login } from "../api/authentication";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export interface userCredentials {
  email: string;
  password: string;
}

const formSchema = z.object({
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email format." }),

  password: z.string().min(3, {
    message: "Password must be at least 3 characters.",
  }),
});

export default function ProfileForm() {
  const [isLoading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const loginSuccess = await login(values);
    if (loginSuccess === false) {
      form.reset();
      setLoading(false);
      console.log("Login returned false");
      setShowError(true);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-Mail</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormDescription>Enter your E-Mail here</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter password"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Enter your password here</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div
            className={
              showError
                ? "block w-full justify-center text-center mt-4"
                : "hidden w-full justify-center text-center mt-4"
            }
          >
            <span className="text-red-500">Wrong Email/Password.</span>
          </div>
          <div className="mt-6">
            <Button type="submit" disabled={isLoading}>
              Login
            </Button>
            {/* </Link> */}
            <Button
              className="ml-4"
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
        </div>

        {/* <Link
          href={"/sessions"}
        > */}
      </form>
    </Form>
  );
}

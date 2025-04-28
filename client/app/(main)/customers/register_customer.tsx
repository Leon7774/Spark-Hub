"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { registerCustomer } from "@/app/api/customers";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export interface userCredentials {
  email: string;
  password: string;
}

const formSchema = z.object({
  first_name: z
    .string()
    .nonempty({ message: "First name is empty" })
    .min(2, { message: "First name is too short" })
    .refine((value) => isNaN(Number(value)), {
      message: "Numbers are not allowed here",
    }),
  last_name: z
    .string()
    .nonempty({ message: "Last name is empty" })
    .min(2, { message: "Last name is too short" })
    .refine((value) => isNaN(Number(value)), {
      message: "Numbers are not allowed here",
    }),
});

export default function RegisterCustomerForm() {
  const [isLoading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false); // State for showing dialog

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit() {
    setShowDialog(true); // Show the dialog when user submits the form
  }

  // 3. Handle the dialog confirmation.
  async function handleConfirm(values: z.infer<typeof formSchema>) {
    setLoading(true);
    console.log("Trying to register");
    const { error } = await registerCustomer(
      values.first_name,
      values.last_name
    );
    if (!error) {
      toast("Event has been created", {
        description: "Sunday, December 03, 2023 at 9:00 AM",
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
    } else {
      toast("An error occured during registry. Contact Leon", {
        // description: "Sunday, December 03, 2023 at 9:00 AM",
        // action: {
        //   label: "Undo",
        //   onClick: () => console.log("Undo"),
        // },
      });
    }
    setShowDialog(false);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
        autoComplete="off"
      >
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="Juan" {...field} />
              </FormControl>
              <FormDescription>Enter First Name Here</FormDescription>
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
                <Input placeholder="Dela Cruz" {...field} />
              </FormControl>
              <FormDescription>Enter Last Name Here</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            Register
          </Button>
          <Button
            className="ml-4"
            type="reset"
            variant={"outline"}
            disabled={isLoading}
            onClick={() => {
              form.reset();
              toast("Event has been created", {
                description: "Sunday, December 03, 2023 at 9:00 AM",
                action: {
                  label: "Undo",
                  onClick: () => console.log("Undo"),
                },
              });
            }}
          >
            Clear
          </Button>
        </div>
      </form>

      {/* AlertDialog to confirm registration */}
      {showDialog && (
        <div className="absolute top-0">
          <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  Do you want to register with the entered details?
                  <br />
                  <br />
                  <span className="font-bold">
                    {form.getValues("first_name") +
                      " " +
                      form.getValues("last_name")}
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setShowDialog(false)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleConfirm(form.getValues())}
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </Form>
  );
}

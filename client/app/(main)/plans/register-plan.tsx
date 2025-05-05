"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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
import { Dispatch, SetStateAction, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { SubscriptionTypes } from "@/utils/types";
import { PlanType } from "@/app/api/plans";
import { Select } from "@/components/ui/select";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import clsx from "clsx";

// This is the schema for the Subsription Plans
export const PlanSubmitSchema = z.object({
  // The ID of a given subscription plan - only for pulling from DB
  plan_id: z.number().nullable(),
  // The date the plan was created - only for pulling from DB
  created_at: z.date().nullable(),
  // The name of a subscription plan
  plan_name: z
    .string()
    .nonempty({ message: "Plan name is empty" })
    .min(2, { message: "Name is too short" }),
  // The type of a subscription plan ["Straight" || "Bundle" || "Hourly"]
  plan_type: z.enum(SubscriptionTypes, {
    message: "Please choose a valid plan type",
  }),
  // OPTIONAL
  // The time included of a subscription plan in HH:mm format
  time_included: z.string().regex(/^\d{1,3}:[0-5]\d$/, {
    message: "Time must be in HH:MM format",
  }),
  // The price of a given subscription plan
  price: z
    .number({ message: "Please enter " })
    .min(0, { message: "The plan price cannot be lower than ₱0.00" }),
  // OPTIONAL
  // The time a given plan may be subscribed i.e. Night Owl Package (6:00PM - 6:00AM)
  time_valid_start: z
    .string()
    .regex(/^\d{2}:\d{2}$/, { message: "Time must be in HH:MM format" })
    .refine(
      (val) => {
        const [hours, minutes] = val.split(":").map(Number);
        return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
      },
      { message: "Invalid time value" }
    )
    .nullable(),
  // OPTIONAL
  // The time a given plan may be subscribed
  time_valid_end: z
    .string()
    .regex(/^\d{2}:\d{2}$/, { message: "Time must be in HH:MM format" })
    .refine(
      (val) => {
        const [hours, minutes] = val.split(":").map(Number);
        return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
      },
      { message: "Invalid time value" }
    )
    .nullable(),

  days_included: z
    .number({ message: "Please input a valid number of days" })
    .min(0, { message: "Please enter a valid number of days" })
    .nullable(),

  expiry_duration: z
    .number({ message: "Please input a valid number of days" })
    .min(0, { message: "Days of validity cannot be less than 0" })
    .nullable(),
});

const planFormSchema = PlanSubmitSchema;

export default function RegisterPlanForm({
  // dialogOpen,
  dialogOpenSet,
}: {
  dialogOpen: boolean;
  dialogOpenSet: Dispatch<SetStateAction<boolean>>;
}) {
  console.log("registerplanform check");

  const [isLoading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false); // State for showing dialog
  const [planType, setPlanType] = useState<PlanType | undefined>(undefined);

  const form = useForm<z.infer<typeof planFormSchema>>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      plan_name: "",
      plan_type: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit() {
    setShowDialog(true); // Show the dialog when user submits the form
  }

  // 3. Handle the dialog confirmation.
  async function handleConfirm(values: z.infer<typeof planFormSchema>) {
    setLoading(true);
    console.log("Trying to register");
    dialogOpenSet(false);
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
          name="plan_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter plan name here"></Input>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input placeholder="Enter action here"></Input>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Controller
          name="plan_type"
          control={form.control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">A</SelectItem>
                <SelectItem value="b">B</SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        <div
          className={clsx(
            "transition-all duration-300 flex-col gap-8 flex",
            planType === "straight"
              ? "opacity-100 max-h-40"
              : "opacity-0 max-h-0"
          )}
        >
          <FormField
            control={form.control}
            name="time_valid_start"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valid Time Start</FormLabel>
                <FormControl>
                  <Input placeholder="Optional"></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time_valid_end"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valid Time End</FormLabel>
                <FormControl>
                  <Input placeholder="Optional"></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
              toast("Log has been created", {
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
                    {/* Enter check details here! */}
                    {/* {form.getValues("first_name") +
                      " " +
                      form.getValues("last_name")} */}
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction
                  onClick={() => handleConfirm(form.getValues())}
                >
                  Confirm
                </AlertDialogAction>
                <AlertDialogCancel onClick={() => setShowDialog(false)}>
                  Cancel
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </Form>
  );
}

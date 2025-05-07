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
import { Input, InputIcon } from "@/components/ui/input";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import clsx from "clsx";
import { PhilippinePeso } from "lucide-react";

// This is the schema for customer sessions
export const SessionSchema = z.object({
  // The ID of a given subscription plan - only for pulling from DB
  plan_id: z.number().nullable(),
});

const planFormSchema = SessionSchema;

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

  const form = useForm<z.infer<typeof planFormSchema>>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      plan_name: "",
      plan_type: "",
      price: 0,
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
                <Input placeholder="Enter plan name here" {...field}></Input>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-x-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  <FormLabel>
                    <div>
                      <span className="transition-all">
                        {planType === "hourly" ? "Hourly Price" : "Price"}
                      </span>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <InputIcon
                      icon={
                        <PhilippinePeso
                          size={15}
                          strokeWidth={2}
                          className="text-muted-foreground p-0"
                        ></PhilippinePeso>
                      }
                      {...field}
                      onFocus={(e) => (e.target.value = "")}
                    ></InputIcon>
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="plan_type"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  <FormLabel>Plan Type</FormLabel>

                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setPlanType(value as PlanType);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bundle">Bundle</SelectItem>
                      <SelectItem value="straight">Straight</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>

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
              <TimePicker12Demo
                date={timeStart}
                setDate={setTimeStart}
              ></TimePicker12Demo>
            )}
          />
          <FormField
            control={form.control}
            name="time_valid_end"
            render={({ field }) => (
              <TimePicker12Demo
                date={timeEnd}
                setDate={setTimeEnd}
              ></TimePicker12Demo>
            )}
          />
        </div>

        <div className="flex justify-end z-10">
          <Button type="submit" disabled={isLoading} className="z-40">
            Register
          </Button>
          <Button
            className="ml-4 z-40"
            type="reset"
            variant={"outline"}
            disabled={isLoading}
            onClick={() => {
              form.reset();
              toast("Form has been cleared", {
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

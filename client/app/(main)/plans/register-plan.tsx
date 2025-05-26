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
import { Input, InputIcon } from "@/components/ui/input";
import { Dispatch, SetStateAction, useState } from "react";

import { Switch } from "@/components/ui/switch";

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
import { SubscriptionTypes } from "@/lib/schemas";
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
  plan_type: z.enum(SubscriptionTypes.options, {
    message: "Please choose a valid plan type",
  }),
  // OPTIONAL
  // The time included of a subscription plan in HH:mm format
  time_included: z.string().regex(/^\d{1,3}:[0-5]\d$/, {
    message: "Time must be in HH:MM format",
  }),
  // The price of a given subscription plan
  price: z.coerce.number({ message: "Please enter a valid price" }).refine(
    (val) => {
      return val > 0;
    },
    { message: "Price cannot be free" }
  ),
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
  // Handles the state of this dialog (hidden / shown)
  dialogOpenSet: Dispatch<SetStateAction<boolean>>;
}) {
  console.log("registerplanform check");

  // Disables the submit button if a server action is ongoing to prevent multiple actions
  const [isLoading, setLoading] = useState(false);
  // State for showing the alert dialog
  const [showDialog, setShowDialog] = useState(false); // State for showing dialog
  // The plan type of the current plan - undefined until chosen
  const [planType, setPlanType] = useState<PlanType | undefined>(undefined);
  // Toggle if the plan is available at a set time
  const [isLimited, setLimited] = useState<boolean>(false);
  // The start and end of a plans availability, if isLimited === true

  const form = useForm<z.infer<typeof planFormSchema>>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      plan_name: "",
      plan_type: "straight",
      price: 0,
    },
  });

  // 2. Define a submit handler.
  async function onSubmit() {
    setShowDialog(true); // Show the dialog when user submits the form
  }

  // 3. Handle the dialog confirmation.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center gap-x-4">
            <span className="text-sm font-medium">Time-Limited</span>
            <Switch checked={isLimited} onCheckedChange={setLimited}></Switch>
          </div>
          <div>
            {" "}
            <div
              className={clsx(
                "transition-all duration-300 grid grid-cols-2 gap-x-2",
                isLimited === true
                  ? "opacity-100 max-h-40"
                  : "opacity-0 max-h-0",
                "bg-background-2  "
              )}
            >
              <div>
                <span>Start Time</span>
                <FormField
                  control={form.control}
                  name="time_valid_start"
                  render={({ field }) => (
                    <Input
                      type="time"
                      {...field}
                      value={field.value ?? ""}
                    ></Input>
                  )}
                />
              </div>
              <div>
                <span>End Time</span>
                <FormField
                  control={form.control}
                  name="time_valid_end"
                  render={({ field }) => (
                    <Input type="time" {...field} value={field.value ?? ""}>
                      {" "}
                      value
                    </Input>
                  )}
                />
              </div>
            </div>
          </div>
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
              setPlanType(undefined);
              setLimited(false);
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

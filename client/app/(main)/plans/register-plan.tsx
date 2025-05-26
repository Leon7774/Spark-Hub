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
import { subscriptionPlanSchema } from "@/lib/schemas";
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

const planFormSchema = z
  .object({
    id: z.number(),
    name: z.string().min(1, "Plan name is required"),
    is_active: z.boolean(),
    price: z
      .number({ message: "Please enter a number" })
      .min(1, "Price is required"),
    plan_type: z.enum(["straight", "bundle", "hourly"]),
    time_included: z.number().nullable(),
    time_valid_start: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Invalid time format, expected HH:mm"
      )
      .nullable(),
    time_valid_end: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Invalid time format, expected HH:mm"
      )
      .nullable(),
    created_at: z.string().nullable(),
    days_included: z.number().min(0).nullable(),
    expiry_duration: z.number().min(0).nullable(),
    available_at: z.array(z.enum(["obrero", "matina"])),
  })
  .refine(
    (data) => {
      if (data.plan_type === "bundle") {
        return data.days_included !== null && data.expiry_duration !== null;
      }
      return true;
    },
    {
      message: "Day passes and expiry duration are required for bundle plans",
      path: ["days_included", "expiry_duration"],
    }
  );

type PlanFormValues = z.infer<typeof planFormSchema>;

export default function RegisterPlanForm({
  dialogOpenSet,
}: {
  dialogOpen: boolean;
  dialogOpenSet: Dispatch<SetStateAction<boolean>>;
}) {
  const [isLoading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [planType, setPlanType] = useState<PlanType | undefined>(undefined);
  const [isLimited, setLimited] = useState<boolean>(false);
  const [bundleIsTimeIncluded, setBundleIsTimeIncluded] = useState(false);

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      id: 0,
      name: "",
      is_active: true,
      price: 0,
      plan_type: "straight",
      time_included: null,
      time_valid_start: null,
      time_valid_end: null,
      created_at: null,
      days_included: null,
      expiry_duration: null,
      available_at: ["obrero"],
    },
  });

  async function onSubmit() {
    setShowDialog(true);
  }

  async function handleConfirm(values: PlanFormValues) {
    setLoading(true);
    console.log("Trying to register", values);
    dialogOpenSet(false);
    setShowDialog(false);
    await fetch("/api/subscription_plans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...values,
      }),
    });
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter plan name here" {...field} />
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
                      type="number"
                      {...field}
                      onChange={(e) => {
                        const value =
                          e.target.value === "" ? 0 : Number(e.target.value);
                        field.onChange(value);
                      }}
                      value={field.value === 0 ? "" : field.value}
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

        {/* Bundle Plan Fields */}
        {planType === "bundle" && (
          <>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                Use Time Instead of Day Passes
              </span>
              <Switch
                checked={bundleIsTimeIncluded}
                onCheckedChange={setBundleIsTimeIncluded}
              />
            </div>

            <div className="">
              {!bundleIsTimeIncluded && (
                <div className="grid grid-cols-2 gap-x-4">
                  <FormField
                    control={form.control}
                    name="days_included"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day Passes Included</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter number of day passes"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expiry_duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valid For (Days)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter validity in days"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              {bundleIsTimeIncluded && (
                <div className="grid grid-cols-2 gap-x-4">
                  <FormField
                    control={form.control}
                    name="time_included"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Included (in minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 600 for 10 hours"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expiry_duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valid For (Days)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter validity in days"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </>
        )}
        {planType === "straight" && (
          <div className="grid grid-cols-2 gap-x-4">
            <FormField
              control={form.control}
              name="time_included"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Included (in minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 120 for 2 hours"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expiry_duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valid For (Days)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter validity in days"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="flex flex-col gap-y-2">
          <div className="flex items-center gap-x-4">
            <span className="text-sm font-medium">Time-Limited</span>
            <Switch checked={isLimited} onCheckedChange={setLimited}></Switch>
          </div>
          <div>
            <div
              className={clsx(
                "transition-all duration-300 grid grid-cols-2 gap-x-2",
                isLimited === true
                  ? "opacity-100 max-h-40"
                  : "opacity-0 max-h-0"
              )}
            >
              <div>
                <span>Start Time</span>
                <FormField
                  control={form.control}
                  name="time_valid_start"
                  render={({ field }) => (
                    <Input type="time" {...field} value={field.value ?? ""} />
                  )}
                />
              </div>
              <div>
                <span>End Time</span>
                <FormField
                  control={form.control}
                  name="time_valid_end"
                  render={({ field }) => (
                    <Input type="time" {...field} value={field.value ?? ""} />
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end z-10">
          <Button type="submit" disabled={isLoading} className="z-40">
            {isLoading ? "Registering..." : "Register"}
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
              toast("Form has been cleared");
            }}
          >
            Clear
          </Button>
        </div>
      </form>

      {showDialog && (
        <div className="absolute top-0">
          <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Plan Registration</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to register this plan with the following
                  details?
                  <br />
                  <br />
                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold">Name:</span>{" "}
                      {form.getValues("name")}
                    </p>
                    <p>
                      <span className="font-semibold">Type:</span>{" "}
                      {form.getValues("plan_type").charAt(0).toUpperCase() +
                        form.getValues("plan_type").slice(1)}
                    </p>
                    <p>
                      <span className="font-semibold">Price:</span> ₱
                      {form.getValues("price")}
                    </p>
                    {isLimited && (
                      <>
                        <p>
                          <span className="font-semibold">Valid Hours:</span>{" "}
                          {form.getValues("time_valid_start")} -{" "}
                          {form.getValues("time_valid_end")}
                        </p>
                      </>
                    )}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction
                  onClick={() => handleConfirm(form.getValues())}
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "Confirm"}
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

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { mutate } from "swr";

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
import { PhilippinePeso } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const planFormSchema = z
  .object({
    id: z.number().optional(),
    name: z.string().min(1, "Plan name is required"),
    is_active: z.boolean(),
    price: z
      .number({ message: "Please enter a number" })
      .min(1, "Price is required"),
    plan_type: z.enum(["straight", "bundle", "hourly", "timed"]),
    time_included: z.number().nullable(),
    time_valid_start: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Invalid time format, expected HH:mm",
      )
      .nullable(),
    time_valid_end: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Invalid time format, expected HH:mm",
      )
      .nullable(),
    created_at: z.string().nullable(),
    days_included: z.number().min(0).nullable(),
    expiry_duration: z.number().min(0).nullable(),
    available_at: z
      .array(z.enum(["obrero", "matina"]))
      .min(1, "At least one branch must be selected"),
  })
  .superRefine((data, ctx) => {
    // Common validations for all plan types
    if (!data.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Plan name is required",
        path: ["name"],
      });
    }

    if (!data.price || data.price <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Price must be greater than 0",
        path: ["price"],
      });
    }

    // Plan type specific validations
    if (data.plan_type === "bundle") {
      const hasDays = data.days_included !== null && data.days_included > 0;
      const hasTime = data.time_included !== null && data.time_included > 0;
      const hasExpiry =
        data.expiry_duration !== null && data.expiry_duration > 0;

      if (hasDays && hasTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cannot have both days and time included for bundle plans",
          path: ["days_included"],
        });
      }

      if (!hasDays && !hasTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Either days or time must be included for bundle plans",
          path: ["days_included"],
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Either days or time must be included for bundle plans",
          path: ["time_included"],
        });
      }

      if (!hasExpiry) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Expiry duration is required for bundle plans",
          path: ["expiry_duration"],
        });
      }
    } else if (data.plan_type === "timed") {
      // Always require time for timed plans
      if (!data.time_valid_start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Start time is required for timed plans",
          path: ["time_valid_start"],
        });
      }

      if (!data.time_valid_end) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End time is required for timed plans",
          path: ["time_valid_end"],
        });
      }

      if (data.time_valid_start && data.time_valid_end) {
        const start = new Date(`1970-01-01T${data.time_valid_start}`);
        const end = new Date(`1970-01-01T${data.time_valid_end}`);

        if (start >= end) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "End time must be after start time",
            path: ["time_valid_end"],
          });
        }
      }
    } else if (data.plan_type === "straight") {
      if (data.time_included === null || data.time_included <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Time included is required",
          path: ["time_included"],
        });
      }
    }
  });

type PlanFormValues = z.infer<typeof planFormSchema>;

export default function RegisterPlanForm({
  dialogOpenSet,
}: {
  dialogOpen: boolean;
  dialogOpenSet: Dispatch<SetStateAction<boolean>>;
}) {
  const [isLoading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [bundleIsTimeIncluded, setBundleIsTimeIncluded] = useState(false);

  function handlePlanTypeChange(type: PlanType) {
    // Reset relevant fields when plan type changes
    form.setValue("time_included", null);
    form.setValue("days_included", null);
    form.setValue("expiry_duration", null);
    form.setValue("time_valid_start", null);
    form.setValue("time_valid_end", null);
    // setShowTimeWarning(false);

    // Clear any existing errors
    form.clearErrors([
      "time_included",
      "days_included",
      "expiry_duration",
      "time_valid_start",
      "time_valid_end",
    ]);
  }

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      id: undefined,
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

  const planType = form.watch("plan_type");

  async function onSubmit(values: PlanFormValues) {
    // This function will only be called if validation passes

    console.log("Form is valid, showing dialog with values:", values);
    setShowDialog(true);
  }

  async function handleConfirm(values: PlanFormValues) {
    setLoading(true);
    values.id = undefined;
    values.created_at = new Date().toISOString();
    console.log("Trying to register", values);

    try {
      const response = await fetch("../api/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Reset the form
      form.reset({
        id: undefined,
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
      });

      // Reset local state
      setBundleIsTimeIncluded(false);

      dialogOpenSet(false);
      setShowDialog(false);
      toast.success("Plan created successfully!");
    } catch (error) {
      console.error("Error creating plan:", error);
      toast.error("Failed to create plan. Please try again.");
    } finally {
      setLoading(false);
      mutate("/api/plan");
    }
  }

  // async function handleConfirm(values: PlanFormValues) {
  //   setLoading(true);
  //   console.log("Trying to register", values);
  //   try {
  //     await fetch("../api/plan", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(values),
  //     });
  //
  //     // Reset the form
  //     form.reset({
  //       id: 0,
  //       name: "",
  //       is_active: true,
  //       price: 0,
  //       plan_type: "straight",
  //       time_included: null,
  //       time_valid_start: null,
  //       time_valid_end: null,
  //       created_at: null,
  //       days_included: null,
  //       expiry_duration: null,
  //       available_at: ["obrero"],
  //     });
  //
  //     // Reset local state
  //     setPlanType(undefined);
  //     setBundleIsTimeIncluded(false);
  //
  //     dialogOpenSet(false);
  //     setShowDialog(false);
  //     toast.success("Plan created successfully!");
  //   } catch (error) {
  //     console.error("Error creating plan:", error);
  //     toast.error("Failed to create plan. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // }

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
                      handlePlanTypeChange(value as PlanType);
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
                      <SelectItem value="timed">Timed</SelectItem>
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
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>
        )}
        {/* Time Fields for Timed Plan */}
        {planType === "timed" && (
          <div className="grid grid-cols-2 gap-x-4">
            <FormField
              control={form.control}
              name="time_valid_start"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time *</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      value={field.value ?? ""}
                      className={
                        form.formState.errors.time_valid_start
                          ? "border-red-500"
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="time_valid_end"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time *</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      value={field.value ?? ""}
                      className={
                        form.formState.errors.time_valid_end
                          ? "border-red-500"
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>
        )}
        {/* Branch Selection */}
        <div className="space-y-2">
          <FormLabel>Available at Branches</FormLabel>
          <FormField
            control={form.control}
            name="available_at"
            render={({ field }) => (
              <FormItem>
                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="obrero"
                      checked={field.value?.includes("obrero")}
                      onCheckedChange={(checked) => {
                        const newValue = checked
                          ? [...(field.value || []), "obrero"]
                          : field.value?.filter((v) => v !== "obrero") || [];
                        field.onChange(newValue);
                      }}
                    />
                    <Label htmlFor="obrero" className="font-normal">
                      Obrero
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="matina"
                      checked={field.value?.includes("matina")}
                      onCheckedChange={(checked) => {
                        const newValue = checked
                          ? [...(field.value || []), "matina"]
                          : field.value?.filter((v) => v !== "matina") || [];
                        field.onChange(newValue);
                      }}
                    />
                    <Label htmlFor="matina" className="font-normal">
                      Matina
                    </Label>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end z-40">
          <Button
            onClick={async () => {
              const isValid = await form.trigger(); // Manually trigger validation
              console.log("Manual validation result:", isValid);
              console.log("Manual validation errors:", form.formState.errors);
              if (isValid) {
                console.log("Form values (manual):", form.getValues());
              }
            }}
            type="submit"
            disabled={isLoading}
            className="z-100"
          >
            {isLoading ? "Registering..." : "Register"}
          </Button>
          <Button
            className="ml-4 z-40"
            type="reset"
            variant={"outline"}
            disabled={isLoading}
            onClick={() => {
              form.reset({
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
                available_at: ["obrero", "matina"],
              });
              setPlanType(undefined);
              setBundleIsTimeIncluded(false);
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

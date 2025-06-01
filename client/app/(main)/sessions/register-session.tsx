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
import { Dispatch, SetStateAction, useState, useEffect } from "react";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { SubscriptionTypes } from "@/utils/types";
import { PlanType, Plan } from "@/app/api/plans";
import { Select } from "@/components/ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import clsx from "clsx";
import { PhilippinePeso, Search } from "lucide-react";
import { Customer } from "@/app/api/customers";
import { createClient } from "@/utils/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useSWR from "swr";
import { mutate } from "swr";
import { SubscriptionActive, SubscriptionPlan } from "@/lib/schemas";

// Enhanced schema for both session and plan registration
export const RegistrationSchema = z.object({
  customer_id: z.number({
    required_error: "Please select a customer",
  }),
  registration_type: z.enum(["session", "plan_purchase"], {
    required_error: "Please select registration type",
  }),
  // Session fields
  session_type: z
    .enum(["subscription", "straight", "hourly", "timed", "custom"])
    .nullable(),
  plan_id: z.number().nullable(),
  custom_start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, { message: "Time must be in HH:MM format" })
    .optional()
    .or(z.literal("").transform(() => undefined)), // Handle empty strings
  custom_end_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, { message: "Time must be in HH:MM format" })
    .optional()
    .or(z.literal("").transform(() => undefined)), // Handle empty strings
  custom_session_length: z.number().optional(),
  // Plan purchase field
  purchase_plan_id: z.number().nullable(),
  custom_price: z.number().optional(),
  subscription_id: z.number().nullable(),
  branch: z.string().optional(),
});

const registrationFormSchema = RegistrationSchema;

export default function RegisterSessionForm({
  dialogOpen,
  dialogOpenSet,
}: {
  dialogOpen: boolean;
  dialogOpenSet: Dispatch<SetStateAction<boolean>>;
}) {
  const [isLoading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [registrationType, setRegistrationType] = useState<string>("session");
  const [sessionType, setSessionType] = useState<string | undefined>(undefined);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [allPlans, setAllPlans] = useState<SubscriptionPlan[]>([]);
  const [bundlePlans, setBundlePlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionActive[]>([]);
  const [customerSubscriptions, setCustomerSubscriptions] = useState<
    SubscriptionActive[]
  >([]);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);

  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const {
    data: customersData,
    error: customersError,
    isLoading: customersLoading,
  } = useSWR<Customer[]>("/api/customer", fetcher);

  const {
    data: plansData,
    error: plansError,
    isLoading: plansLoading,
  } = useSWR<SubscriptionPlan[]>("/api/plan", fetcher);

  const {
    data: subscriptionsData,
    error: subscriptionsError,
    isLoading: subscriptionsLoading,
  } = useSWR<SubscriptionActive[]>("/api/subscription", fetcher);

  useEffect(() => {
    if (customersData) {
      setCustomers(customersData);
    }
  }, [customersData]);

  useEffect(() => {
    if (plansData) {
      setAllPlans(plansData);
      // Filter for active plans for sessions
      setAvailablePlans(plansData.filter((plan) => plan.is_active));
      // Filter for bundle plans only for subscriptions
      setBundlePlans(
        plansData.filter(
          (plan) => plan.is_active && plan.plan_type === "bundle",
        ),
      );
    }
  }, [plansData]);

  useEffect(() => {
    if (subscriptionsData) {
      setSubscriptions(subscriptionsData);
    }
  }, [subscriptionsData]);

  // Filter customer's active subscriptions when customer changes
  useEffect(() => {
    if (selectedCustomer && subscriptions.length > 0) {
      const customerSubs = subscriptions.filter(
        (sub) => sub.customer_id === selectedCustomer.id,
      );
      setCustomerSubscriptions(customerSubs);
    } else {
      setCustomerSubscriptions([]);
    }
  }, [selectedCustomer, subscriptions]);

  // Get filtered plans based on session type
  const getFilteredPlans = () => {
    if (!sessionType || !allPlans.length) return [];

    switch (sessionType) {
      case "straight":
        return allPlans.filter(
          (plan) => plan.is_active && plan.plan_type === "straight",
        );
      case "hourly":
        return allPlans.filter(
          (plan) => plan.is_active && plan.plan_type === "hourly",
        );
      case "timed":
        return allPlans.filter(
          (plan) => plan.is_active && plan.plan_type === "timed",
        );
      case "subscription":
        // Return plans that the customer is subscribed to
        if (customerSubscriptions.length === 0) return [];
        const subscribedPlanIds = customerSubscriptions.map(
          (sub) => sub.plan_id,
        );
        return allPlans
          .filter((plan) => subscribedPlanIds.includes(plan.id))
          .map((plan) => ({
            ...plan,
            expiry_length: customerSubscriptions.find(
              (sub) => sub.plan_id === plan.id,
            )?.expiry_duration,
          }));
      default:
        return [];
    }
  };

  const form = useForm<z.infer<typeof registrationFormSchema>>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      customer_id: undefined,
      registration_type: "session",
      session_type: undefined,
      plan_id: null,
      purchase_plan_id: null,
      custom_start_time: undefined,
      custom_end_time: undefined,
      custom_session_length: undefined,
      custom_price: undefined,
      subscription_id: null,
      branch: "", // Default branch
    },
  });

  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer) =>
    `${customer.first_name} ${customer.last_name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  // Calculate session length and time left based on plan and session type
  const calculateSessionData = (
    values: z.infer<typeof registrationFormSchema>,
  ) => {
    let sessionLength = 0;
    let timeLeft = 0;

    if (values.session_type === "custom") {
      sessionLength = values.custom_session_length || 0;
      timeLeft = sessionLength;
    } else if (values.plan_id) {
      const selectedPlan = allPlans.find((plan) => plan.id === values.plan_id);
      if (selectedPlan) {
        if (values.session_type === "subscription") {
          // For subscription sessions, use remaining time from customer's subscription
          const customerSub = customerSubscriptions.find(
            (sub) => sub.plan_id === values.plan_id,
          );
          timeLeft = customerSub?.time_left || 0;
          sessionLength = selectedPlan.time_included || 0;
        } else {
          // For other session types, use plan's time
          sessionLength = selectedPlan.time_included || 0;
          timeLeft = sessionLength;
        }
      }
    }

    return { sessionLength, timeLeft };
  };

  async function onSubmit() {
    setShowDialog(true);
  }

  async function handleConfirm(values: z.infer<typeof registrationFormSchema>) {
    setLoading(true);

    console.log("Trying to register");

    const { sessionLength, timeLeft } = calculateSessionData(values);

    // Find subscription_id if it's a subscription session
    let subscriptionId = null;
    if (values.session_type === "subscription" && values.plan_id) {
      const customerSub = customerSubscriptions.find(
        (sub) => sub.plan_id === values.plan_id,
      );
      subscriptionId = customerSub?.id || null;
    }

    try {
      const supabase = await createClient();

      if (values.registration_type === "session") {
        // Handle session registration
        console.log("Trying to register session here!!!!");

        const sessionData = {
          customer_id: values.customer_id,
          plan_id: values.plan_id,
          start_time:
            values.session_type === "custom" && values.custom_start_time
              ? new Date(
                  `${new Date().toDateString()} ${values.custom_start_time}`,
                ).toISOString()
              : new Date().toISOString(),
          end_time:
            values.session_type === "custom" && values.custom_end_time
              ? new Date(
                  `${new Date().toDateString()} ${values.custom_end_time}`,
                ).toISOString()
              : null,
          session_length: sessionLength,
          time_left: timeLeft,
          subscription_id: subscriptionId,
          branch: values.branch || "main",
        };

        const { error } = await supabase.from("sessions").insert(sessionData);
        if (error) throw error;

        // // If it's a subscription session, update the subscription's remaining time
        // if (values.session_type === "subscription" && subscriptionId) {
        //   const customerSub = customerSubscriptions.find(
        //     (sub) => sub.plan_id === values.plan_id,
        //   );
        //   if (customerSub) {
        //     const newTimeLeft = Math.max(
        //       0,
        //       (customerSub.time_left || 0) - sessionLength,
        //     );
        //     await supabase
        //       .from("subscriptions")
        //       .update({ time_left: newTimeLeft })
        //       .eq("id", subscriptionId);
        //   }
        // }

        mutate("/api/subscription");
        mutate("/api/customer");
        mutate("/api/session");
        toast.success("Session registered successfully");
      } else if (values.registration_type === "plan_purchase") {
        /*
        PLAN PURCHASE
         */
        // Handle plan purchase using API
        const response = await fetch(
          `/api/customer/${form.getValues().customer_id}/subscriptions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              customer_id: values.customer_id,
              plan_id: values.purchase_plan_id,
            }),
          },
        );

        const result = await response.json();

        if (!response.ok) {
          console.log(result.error.message);
          throw new Error(result.error || "Failed to purchase plan");
        }

        console.log("Trying to register session here!!!!");

        const sessionData = {
          customer_id: values.customer_id,
          plan_id: result.subscription.plan_id,
          start_time:
            values.session_type === "custom" && values.custom_start_time
              ? new Date(
                  `${new Date().toDateString()} ${values.custom_start_time}`,
                ).toISOString()
              : new Date().toISOString(),
          end_time:
            values.session_type === "custom" && values.custom_end_time
              ? new Date(
                  `${new Date().toDateString()} ${values.custom_end_time}`,
                ).toISOString()
              : null,
          session_length: sessionLength,
          time_left: result.subscription.time_left,
          subscription_id: subscriptionId,
          branch: values.branch || "main",
        };

        console.log(sessionData);

        const { error } = await supabase.from("sessions").insert(sessionData);

        if (error) {
          console.log(error);
          throw new Error(result.error || "Failed to purchase plan");
        }

        toast.success(result.message || "Plan purchased successfully");

        // Mutate SWR data to refresh
        mutate("/api/subscription");
        mutate("/api/customer");
        mutate("/api/session");
      }

      dialogOpenSet(false);
      setShowDialog(false);
      form.reset();
      setSelectedCustomer(null);
      setSessionType(undefined);
      setRegistrationType("session");
    } catch (error) {
      console.error("Error processing registration:", error.message);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to process registration",
      );
    } finally {
      setLoading(false);
    }
  }

  const getConfirmationMessage = () => {
    const values = form.getValues();
    if (values.registration_type === "session") {
      return "Are you sure you want to register this session? This action cannot be undone.";
    } else {
      const selectedPlan = bundlePlans.find(
        (plan) => plan.id === values.purchase_plan_id,
      );
      return `Are you sure you want to purchase the ${selectedPlan?.name} plan for ₱${selectedPlan?.price}? This will charge the customer and activate their subscription.`;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Registration Type Selection */}
        <FormField
          control={form.control}
          name="registration_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registration Type</FormLabel>
              <Tabs
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  setRegistrationType(value);
                  // Reset form when switching types
                  form.setValue("session_type", null);
                  form.setValue("plan_id", null);
                  form.setValue("purchase_plan_id", null);
                  setSessionType(undefined);
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="session">Start Session</TabsTrigger>
                  <TabsTrigger value="plan_purchase">Purchase Plan</TabsTrigger>
                </TabsList>
              </Tabs>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Customer Selection */}
        <FormField
          control={form.control}
          name="customer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input
                    placeholder="Select a customer..."
                    value={
                      selectedCustomer
                        ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`
                        : ""
                    }
                    readOnly
                    className="cursor-pointer"
                    onClick={() => setShowCustomerDialog(true)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCustomerDialog(true)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Customer Selection Dialog */}
        <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Select Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Search customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="max-h-[300px] overflow-y-auto border rounded-md">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className={`p-2 cursor-pointer hover:bg-gray-100 ${
                      selectedCustomer?.id === customer.id ? "bg-gray-100" : ""
                    }`}
                    onClick={() => {
                      setSelectedCustomer(customer);
                      form.setValue("customer_id", customer.id);
                      setShowCustomerDialog(false);
                    }}
                  >
                    {customer.first_name} {customer.last_name}
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Session Registration Fields */}
        {registrationType === "session" && (
          <>
            {/* Session Type Selection */}
            <FormField
              control={form.control}
              name="session_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSessionType(value);
                    }}
                    value={field.value || ""}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a session type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subscription">Subscription</SelectItem>
                      <SelectItem value="straight">Straight</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="timed">Timed</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Plan Selection for Sessions */}
            {sessionType && sessionType !== "custom" && (
              <FormField
                control={form.control}
                name="plan_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Select Plan
                      {sessionType === "subscription" &&
                        customerSubscriptions.length === 0 && (
                          <span className="text-sm text-muted-foreground ml-2">
                            (No active subscriptions)
                          </span>
                        )}
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString() || ""}
                      disabled={
                        sessionType === "subscription" &&
                        customerSubscriptions.length === 0
                      }
                    >
                      <SelectTrigger className="w-full !h-15">
                        <SelectValue
                          placeholder={
                            sessionType === "subscription" &&
                            customerSubscriptions.length === 0
                              ? "Customer has no active subscriptions"
                              : `Select a ${sessionType} plan`
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {getFilteredPlans().map((plan) => (
                          <SelectItem key={plan.id} value={plan.id.toString()}>
                            <div className="flex flex-col items-baseline">
                              <span className="font-medium">
                                {plan.name} - ₱{plan.price}
                              </span>
                              <span className="text-sm text-muted-foreground capitalize">
                                {plan.plan_type}
                                {plan.time_included &&
                                  ` • ${plan.time_included} mins`}
                                {plan.days_included &&
                                  ` • ${plan.days_included} days`}
                                {sessionType === "subscription" &&
                                  (() => {
                                    const subscription =
                                      customerSubscriptions.find(
                                        (sub) => sub.plan_id === plan.id,
                                      );
                                    return subscription ? (
                                      <>
                                        {subscription.time_left &&
                                          ` • ${subscription.time_left} mins left`}
                                        {subscription.days_left &&
                                          ` • ${subscription.days_left} days left`}
                                      </>
                                    ) : null;
                                  })()}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Custom Session Fields */}
            {sessionType === "custom" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="custom_start_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="custom_end_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="custom_session_length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Length (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter session length in minutes"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="custom_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <InputIcon
                          icon={
                            <PhilippinePeso
                              size={15}
                              strokeWidth={2}
                              className="text-muted-foreground p-0"
                            />
                          }
                          type="number"
                          {...field}
                          value={field.value || 0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </>
        )}

        {/* Plan Purchase Fields - Only Bundle Plans */}
        {registrationType === "plan_purchase" && (
          <FormField
            control={form.control}
            name="purchase_plan_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Bundle Plan to Purchase</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value?.toString() || ""}
                >
                  <SelectTrigger className="w-full !h-15">
                    <SelectValue placeholder="Select a bundle plan to purchase" />
                  </SelectTrigger>
                  <SelectContent>
                    {bundlePlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id?.toString()}>
                        <div className="flex flex-col items-baseline px">
                          <span className="font-medium">
                            {plan.name} - ₱{plan.price}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Bundle Plan •
                            {plan.time_included &&
                              ` ${plan.time_included} mins`}
                            {plan.days_included &&
                              ` ${plan.days_included} days`}
                            {plan.expiry_duration &&
                              ` • Expires in ${plan.expiry_duration} days`}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Branch Selection */}
        <FormField
          control={form.control}
          name="branch"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || undefined}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="obrero">Obrero</SelectItem>
                  <SelectItem value="matina">Matina</SelectItem>
                  {/* Add more branches as needed */}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          onClick={() => {
            try {
              registrationFormSchema.parse(form.getValues());
            } catch (err) {
              if (err instanceof z.ZodError) {
                console.log(err.flatten()); // 👈 Clean object format
                // or: console.error(err.errors); // raw array of issues
              }
            }
          }}
          disabled={isLoading}
        >
          {isLoading
            ? registrationType === "session"
              ? "Registering..."
              : "Processing..."
            : registrationType === "session"
              ? "Register Session"
              : "Purchase Plan"}
        </Button>
      </form>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {registrationType === "session"
                ? "Confirm Session Registration"
                : "Confirm Plan Purchase"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getConfirmationMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleConfirm(form.getValues());
              }}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}
